require('dotenv').config()
const express = require('express')
const routerRoutes = require('./routes/users')
const mongoose = require('mongoose')
const cors = require('cors');
const cookieParser = require('cookie-parser')

const http = require('http')
const { Server } = require('socket.io')

//express app
const app = express()
app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (use frontend URL for security in production)
    methods: ["GET", "POST"],
    credentials: true,  // Enable credentials (cookies, authorization headers)
  }
});

// Save io in app locals so that it can be accessed from controllers
app.set('io', io);

// WebSocket connection handler
io.on('connection', (socket) => {
  //console.log(`user connected:  ${socket.id}`);
  // Handle when a player joins a session
  socket.on('joinSession', (data) => {

    const { playerID, gameCode } = data;

    // Store playerID in the socket object for future use
    socket.playerID = playerID;
    socket.gameCode = gameCode;

    console.log(`${playerID} joined the game session with code: ${gameCode}`);
    // Notify all clients in this session about the new player
    socket.broadcast.emit('playerJoined', {playerID});

// You can also notify players in the same gameCode room only
    // io.to(gameCode).emit('playerJoined', { playerID });

  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

//middleware
app.use(cookieParser())
app.use(express.json()) //looks if there is an audit to the request/ if data was sent in to the server
app.use(cors());
//route

app.use('/api/routes', routerRoutes)




//db
mongoose.connect(process.env.MONG_URL)
  .then(() => {
    //listener for requests
    server.listen(4000, () => {
      console.log('SERVER IS RUNNING & connected to db & listening on port', process.env.PORT)
    })


  }).catch((error) => {
    console.log(error)
  })


