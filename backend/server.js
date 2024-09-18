require('dotenv').config()

const express = require('express')
const routerRoutes = require('./routes/users')
const mongoose = require('mongoose')

//express app
const app = express()

//middleware for logging

app.use(express.json()) //looks if there is an audit to the request/ if data was sent in to the server
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

//route
app.use('/api/routes', routerRoutes)

//db
mongoose.connect(process.env.MONG_URL)
    .then(() => {
        //listener for requests
        app.listen(process.env.PORT, () => {
            console.log('connected to db & listening on port', process.env.PORT)
        })
    }).catch((error) => {
        console.log(error)
    })


