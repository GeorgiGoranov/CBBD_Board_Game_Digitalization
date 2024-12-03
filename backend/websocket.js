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
      origin: 'http://localhost:3000',
      methods: ["GET", "POST"],
      credentials: true, // Enable credentials (cookies, authorization headers)
    }
  });

  io.on('connection', (socket) => {
    console.log(`User back-end initial connection: ${socket.id}`);

    // Handle when a player joins a session
    socket.on('joinSession', (data) => {

      const { playerID, gameCode } = data;

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
      } else {
        // Add the new player to the room if not already present
        rooms[gameCode].push({ playerID, socketId: socket.id });
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
      io.to(gameCode).emit('playerJoined', { playerID });
      // Notify everyone in this specific room with the updated player list
      io.to(gameCode).emit('updatePlayerList', rooms[gameCode].map(player => player.playerID));
    });

    socket.on('dragDropUpdate', (data) => {
      const { gameCode } = data;
      // Broadcast the dragDropUpdate event to all clients in the same room
      socket.to(gameCode).emit('dragDropUpdate', data);
    });

    // Capture and broadcast cursor position
    socket.on('cursorMove', (data) => {
      const { x, y, playerID, gameCode } = data;
      // Broadcast the cursor position to all players in the room except the sender
      socket.to(gameCode).emit('cursorUpdate', { x, y, playerID });
    });

    socket.on('sendMessage', async (data) => {
      const { message } = data;

      const result = await saveMessage(message);

      if (result.success) {
        socket.to(message.roomId).emit('receiveMessage', { message: result.message });
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
    socket.on('nextDilemmaCard', (data) => {
      const { roomId } = data;

      // Broadcast the event to all players in the room
      io.to(roomId).emit('nextDilemmaCard');

      console.log(`Moderator requested a new dilemma card in room: ${roomId}`);
    });

    socket.on('newDilemmaCardData', (data) => {
      const { roomId, card } = data;

      // Broadcast the new card data to all users in the room
      io.to(roomId).emit('updateDilemmaCardData', card);

      console.log(`Broadcasted new dilemma card data for room: ${roomId}`);
    });



    socket.on('vote', (data) => {
      const { vote, roomId } = data;

      if (!roomVotes[roomId]) {
        roomVotes[roomId] = { agree: 0, disagree: 0 };
      }

      if (vote === 'agree') {
        roomVotes[roomId].agree += 1;
      } else if (vote === 'disagree') {
        roomVotes[roomId].disagree += 1;
      }

      // Broadcast updated vote counts to all clients in the room
      io.to(roomId).emit('updateVotes', roomVotes[roomId]);
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
        // Emit the updated player list to everyone in the room
        io.to(roomCode).emit('updatePlayerList', rooms[roomCode].map(player => player.playerID));
        io.to(roomCode).emit('playerLeftRoom', playerID);


        console.log(`${playerID} left room: ${roomCode}`);
      }
    });

  });

  return io;
}

module.exports = setupWebSocket;
