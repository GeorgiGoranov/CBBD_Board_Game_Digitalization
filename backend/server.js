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
    methods: ["GET", "POST"]
  }
});

// Save io in app locals so that it can be accessed from controllers
app.set('io', io);

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log(`user connected:  ${socket.id}`);
  // Handle when a player joins a session
  socket.on('joinSession',  (data) => {
    
      // Notify all clients in this session about the new player
      socket.broadcast.emit('playerJoined', data);

      
  
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

//middleware
app.use(cors());
app.use(express.json()) //looks if there is an audit to the request/ if data was sent in to the server
app.use(cookieParser())
//route

app.use('/api/routes', routerRoutes)




//db
mongoose.connect(process.env.MONG_URL)
  .then(() => {
    //listener for requests
    server.listen(4000, ()=>{
      console.log('SERVER IS RUNNING & connected to db & listening on port', process.env.PORT)
    })
      
    
  }).catch((error) => {
    console.log(error)
  })


