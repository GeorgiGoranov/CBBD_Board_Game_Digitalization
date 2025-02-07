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

const io = setupWebSocket(server)


app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})
// Make `io` available to the rest of the app
app.set('socketio', io);


//middleware
app.use(express.json()) //looks if there is an audit to the request/ if data was sent in to the server
app.use(cookieParser())

const allowedOrigins = [process.env.FRONT_END_URL_HOST, process.env.BACK_END_URL_HOST];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'Accept'],
  credentials: true,
  exposedHeaders: ['Set-Cookie'],

}));

// Handle preflight requests
app.options('*', cors());

//route
app.use('/api/routes', userRoutes)
app.use('/api/cards', cardsAndSheetsRoutes)
app.use('/api/rounds', rounds)



//db
mongoose.connect(process.env.MONG_URL_CBBD)
  .then(() => {
    //listener for requests
    server.listen(process.env.PORT, () => {

      console.log('SERVER IS RUNNING & connected to db & listening on port', process.env.PORT)
    })


  }).catch((error) => {
    console.error('Error connecting to the database:', error.message);
  })


