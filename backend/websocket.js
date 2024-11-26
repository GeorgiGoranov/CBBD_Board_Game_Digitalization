const { Server } = require('socket.io');

const { saveMessage } = require('./controllers/roundsController');


// In-memory stores
const rooms = {};       // To keep track of players in rooms
const roomRounds = {};  // To keep track of current round per room
let votes = { one: 0, two: 0 }; // Store votes for buttons

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

    socket.on('disconnect', () => {
      console.log(`User back-end disconnected: ${socket.id}`);
    });

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
      socket.emit('updateVotes', votes);

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

    socket.on('disconnect', () => {
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

    socket.on('changeDilemmaCard', (data) => {
      const { roomId, click } = data;

      if (click) {
        // Broadcast to all users in the room to fetch a new card
        io.to(roomId).emit('newDilemmaCard');
        console.log(`Broadcasted new dilemma card event for room: ${roomId}`);
      }
    });

    // Handle votes from participants
    socket.on('vote', (data) => {
      const { vote } = data;

      if (vote === 'one') {
        votes.one += 1;
      } else if (vote === 'two') {
        votes.two += 1;
      }

      // Broadcast updated vote counts to all clients
      io.emit('updateVotes', votes);
    });

    // Handle resetting votes when a new dilemma card is selected
    socket.on('resetVotes', () => {
      votes = { one: 0, two: 0 }; // Reset vote counts
      io.emit('updateVotes', votes); // Notify all clients to reset their vote counts
    });






  });

  return io;
}

module.exports = setupWebSocket;
