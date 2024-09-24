require('dotenv').config()

const express = require('express')
const routerRoutes = require('./routes/users')
const mongoose = require('mongoose')
const cors = require('cors');

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
  console.log(`user connected:  ${socket.id}`)

  socket.on('send_message', (data) =>{
    socket.broadcast.emit('receive_message', data)
  })
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


