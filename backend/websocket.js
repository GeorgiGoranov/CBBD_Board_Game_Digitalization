const { Server } = require('socket.io');

// In-memory store to keep track of players and their rooms
const rooms = {};

// WebSocket setup
function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ["GET", "POST"],
      credentials: true, // Enable credentials (cookies, authorization headers)
    }
  });

  // Save io in app locals so that it can be accessed from controllers
  // You can choose to return io instead if you don't need to access it from app.locals
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

      // Notify everyone in this specific room about the new player
      io.to(gameCode).emit('playerJoined', { playerID });
      // Notify everyone in this specific room with the updated player list
      io.to(gameCode).emit('updatePlayerList', rooms[gameCode].map(player => player.playerID));
    });~

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


  });

  return io;
}

module.exports = setupWebSocket;
