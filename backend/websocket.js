const { Server } = require('socket.io');
const { saveMessage } = require('./controllers/roundsController');


// In-memory stores
const rooms = {};       // To keep track of players in rooms
const roomRounds = {};  // To keep track of current round per room
const roomVotes = {}; // Store votes per room: { [roomId]: { agree: number, disagree: number } }



// WebSocket setup
function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'https://cbbd-board-game-digitalization-1.onrender.com',
      methods: ["GET", "POST"],
      credentials: true, // Enable credentials (cookies, authorization headers)
    }
  });

  io.on('connection', (socket) => {
    console.log(`User back-end initial connection: ${socket.id}`);

    // Handle when a player joins a session
    socket.on('joinSession', (data) => {

      const { playerID, nationality, gameCode, group } = data;

      // Add the player to the room's player list
      if (!rooms[gameCode]) {
        rooms[gameCode] = [];  // Create room if it doesn't exist
        roomRounds[gameCode] = 1; // Initialize round to 0 for new room
      }
      // Find if the player already exists (reconnecting with new socket.id)
      const existingPlayer = rooms[gameCode].find((player) => player.playerID === playerID);

      if (existingPlayer) {
        // Update the player's socketId to the new one (in case of reconnect)
        existingPlayer.socketId = socket.id;
        existingPlayer.group = group; // Update group if needed
      } else {
        // Add the new player to the room if not already present
        rooms[gameCode].push({ playerID, socketId: socket.id, nationality, group });
      }

      // Add the player to the specific room associated with the gameCode
      socket.join(gameCode);

      // Send the current round to the newly connected client
      socket.emit('roundChanged', { roundNumber: roomRounds[gameCode] });

      // Send the current round to the newly connected client
      socket.emit('changeDilemmaCard', { click: true });

      // Send the current vote counts to the newly connected client
      if (!roomVotes[gameCode]) {
        roomVotes[gameCode] = { agree: 0, disagree: 0 };
      }
      socket.emit('updateVotes', roomVotes[gameCode]);

      // Notify everyone in this specific room about the new player
      io.to(gameCode).emit('playerJoined', { playerID, nationality });
      // Notify everyone in this specific room with the updated player list
      io.to(gameCode).emit(
        'updatePlayerList',
        rooms[gameCode].map((player) => ({
          playerID: player.playerID,
          nationality: player.nationality,
          group: player.group
        }))
      );
    });

    socket.on('navigateToRoom', (data) => {
      const { roomId } = data;
      console.log(`Navigating all players in room ${roomId} to game room`);

      // Broadcast the event to all players in the room
      io.to(roomId).emit('navigateToRoom', { roomId });
    });

    socket.on('updateTokens', ({ roomId, groupedPlayers }) => {
      // Broadcast the groupedPlayers data to all players in the room
      socket.to(roomId).emit('updateTokens', { groupedPlayers });
    });

    socket.on('sendGroupMessage', (data) => {
      const { roomId, group, message } = data;

      if (!rooms[roomId]) return;

      const targetPlayers = rooms[roomId].filter(player => String(player.group) === String(group));

      targetPlayers.forEach(player => {
        io.to(player.socketId).emit('receiveGroupMessage', { message });
      });
    });

    socket.on('dragDropUpdate', (data) => {
      const { gameCode, playerID } = data;

      const roomPlayers = rooms[gameCode] || [];
      const triggeringPlayer = roomPlayers.find(p => p.playerID === playerID);

      if (triggeringPlayer) {
        const playerGroup = triggeringPlayer.group;
        const targetPlayers = roomPlayers.filter(p => p.group === playerGroup);

        // Emit only to players in the same group
        targetPlayers.forEach(p => {
          io.to(p.socketId).emit('dragDropUpdate', data);
        });
      }
    });

    // Capture and broadcast cursor position
    socket.on('cursorMove', (data) => {
      const { x, y, playerID, gameCode, group } = data;
      // Broadcast the cursor position to all players in the room except the sender
      socket.to(gameCode).emit('cursorUpdate', { x, y, playerID, group });
    });

    socket.on('sendMessage', async (data) => {
      const { message } = data;

      const result = await saveMessage(message);

      if (result.success) {
        const { roomId, groupNumber } = result.message;

        // Find all players in this room with the same groupNumber
        const roomPlayers = rooms[roomId] || [];
        const targetPlayers = roomPlayers.filter(p => Number(p.group) === Number(groupNumber));

        targetPlayers.forEach((player) => {
          io.to(player.socketId).emit('receiveMessage', { message: result.message });
        });
      } else {
        socket.emit('errorMessage', { error: 'Could not save message' });
      }
    });

    socket.on('changeRound', (data) => {
      const { roomId, roundNumber } = data;
      // Update the current round for the room
      roomRounds[roomId] = roundNumber;

      // Broadcast 'roundChanged' event to all clients in the room
      io.in(roomId).emit('roundChanged', { roundNumber });

      console.log(`Round changed to ${roundNumber} in room ${roomId}`);
    });
    socket.on('newDilemmaCardData', (data) => {
      const { roomId, card } = data;

      // Broadcast the new card data to all users in the room
      io.to(roomId).emit('updateDilemmaCardData', card);

      console.log(`Broadcasted new dilemma card data for room: ${roomId}`);
    });

    socket.on('vote', (data) => {
      const { vote, roomId } = data;

      if (!roomVotes[roomId]) roomVotes[roomId] = {};

      // Increment vote count for the selected option
      if (!roomVotes[roomId][vote]) {
        roomVotes[roomId][vote] = 0;
      }
      roomVotes[roomId][vote] += 1;

      io.to(roomId).emit('updateVotes', roomVotes[roomId]); // Broadcast updated votes
    });

    // Handle resetting votes when a new dilemma card is selected
    socket.on('resetVotes', () => {
      votes = { agree: 0, disagree: 0 }; // Reset vote counts
      io.emit('updateVotes', votes); // Notify all clients to reset their vote counts
    });

    socket.on('disconnect', () => {
      console.log(`User back-end disconnected: ${socket.id}`);

      let roomCode = null;
      let playerID = null;

      // Find the player in each room by matching the socketId
      for (const room in rooms) {
        const playerIndex = rooms[room].findIndex((p) => p.socketId === socket.id);

        if (playerIndex !== -1) {
          // Get the playerID of the player being removed
          playerID = rooms[room][playerIndex].playerID;
          rooms[room].splice(playerIndex, 1);  // Remove player from the room
          roomCode = room;
          break;  // Exit the loop once the player is found
        }
      }

      if (roomCode) {
        // Emit the updated player list to everyone in the room with full player details
        io.to(roomCode).emit(
          'updatePlayerList',
          rooms[roomCode].map(player => ({
            playerID: player.playerID,
            nationality: player.nationality,
            group: player.group
          }))
        );

        // Then emit the playerLeftRoom event for the message
        io.to(roomCode).emit('playerLeftRoom', playerID);

        console.log(`${playerID} left room: ${roomCode}`);
      }
    });

  });

  return io;
}

module.exports = setupWebSocket;
