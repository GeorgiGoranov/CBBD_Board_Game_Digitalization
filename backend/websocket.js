const { Server } = require('socket.io');

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
      
      // Add the player to the specific room associated with the gameCode
      socket.join(gameCode);

      // Notify everyone in this specific room about the new player
      io.to(gameCode).emit('playerJoined', { playerID });
      console.log(playerID)
    });

  });

  return io;
}

module.exports = setupWebSocket;
