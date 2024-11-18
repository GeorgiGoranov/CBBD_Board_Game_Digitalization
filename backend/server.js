require('dotenv').config()
const express = require('express')
const userRoutes = require('./routes/users')
const cardsAndSheetsRoutes = require('./routes/cardsAndSheets')
const rounds = require('./routes/rounds')

const mongoose = require('mongoose')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const http = require('http')



// Import WebSocket setup
const setupWebSocket = require('./websocket')

//express app
const app = express()
const server = http.createServer(app)

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

const io = setupWebSocket(server)

//middleware
app.use(cookieParser())
app.use(express.json()) //looks if there is an audit to the request/ if data was sent in to the server
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));



//route
app.use('/api/routes', userRoutes)
app.use('/api/cards', cardsAndSheetsRoutes)
app.use('/api/rounds', rounds)



//db
mongoose.connect(process.env.MONG_URL_CBBD)
  .then(() => {
    //listener for requests
    server.listen(4000, '0.0.0.0', () => {
      console.log('SERVER IS RUNNING & connected to db & listening on port', process.env.PORT)
    })


  }).catch((error) => {
    console.log(error)
  })


