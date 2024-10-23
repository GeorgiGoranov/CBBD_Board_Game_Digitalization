
const { Server } = require('socket.io');

// In-memory store to keep track of players and their rooms
const players = {};

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
    console.log(`User initial connection: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    // Handle when a player joins a session
    socket.on('joinSession', (data) => {
    
      const { playerID, gameCode } = data;
      console.log(`Player joined: ${playerID}, Game Code: ${gameCode}`);

      // Store the player and the gameCode in the in-memory store
      players[socket.id] = { playerID, gameCode };

      // Add the player to the specific room associated with the gameCode
      socket.join(gameCode);

      // Notify everyone in this specific room about the new player
      io.to(gameCode).emit('playerJoined', { playerID });
      console.log(playerID)
    });

    socket.on('disconnect', () => {
      // Retrieve the player's info from the in-memory store
      const playerInfo = players[socket.id];
      if (playerInfo) {
        const { playerID, gameCode } = playerInfo;

        // Notify the room that the player has disconnected
        io.to(gameCode).emit('playerLeft', { playerID });
        // Remove the player from the in-memory store
        delete players[socket.id];
      } else {
        console.log(`Player with socket ID ${socket.id} was not found in the players list.`);
      }
    });
  });

  return io;
}

module.exports = setupWebSocket;
