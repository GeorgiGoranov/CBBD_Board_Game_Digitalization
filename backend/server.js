require('dotenv').config()

const express = require('express')
const routerRoutes = require('./routes/users')
const mongoose = require('mongoose')
const cors = require('cors');

const SessionModel = require('./models/SessionModel')

const http = require('http')
const { Server } = require('socket.io')

//express app
const app = express()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (use frontend URL for security in production)
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  // Handle when a player joins a session
  socket.on('joinSession', async ({ code, playerID }) => {
    const session = await SessionModel.findOne({ code });
    if (session) {
      session.players.push(playerID);
      await session.save();

      // Notify all clients in this session about the new player
      io.to(code).emit('playerJoined', { playerID, players: session.players });

      // Join the player to a specific "room" (session)
      socket.join(code);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
})

server.listen(4000, ()=>{
  console.log('SERVER IS RUNNING')
})

//middleware for logging

app.use(express.json()) //looks if there is an audit to the request/ if data was sent in to the server
app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

app.use(cors());
//route

app.use('/api/routes', routerRoutes)

//db
mongoose.connect(process.env.MONG_URL)
  .then(() => {
    //listener for requests
    
      console.log('connected to db & listening on port', process.env.PORT)
    
  }).catch((error) => {
    console.log(error)
  })


