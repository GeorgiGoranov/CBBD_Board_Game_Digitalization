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
app.use(cors());


//route
app.use('/api/routes', userRoutes)
app.use('/api/cards', cardsAndSheetsRoutes)
app.use('/api/rounds', rounds)



//db
mongoose.connect(process.env.BACK_END_URL_HOST)
  .then(() => {
    //listener for requests
    server.listen(process.env.PORT, () => {
      console.log('SERVER IS RUNNING & connected to db & listening on port', process.env.BACK_END_URL_HOST)
    })


  }).catch((error) => {
    console.log(error)
  })


