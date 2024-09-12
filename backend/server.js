    require('dotenv').config()    
    
    const express = require('express')
    const routerRoutes = require('./routes/router')

    //express app
    const app = express()

    //middleware for logging

    app.use(express.json()) //looks if there is an audit to the request/ if data was sent in to the server
    app.use((req,res,next)=>{
        console.log(req.path,req.method)
        next()
    })

    //route
    app.use('/api/routes', routerRoutes)

    //listener for requests
    app.listen(process.env.PORT, ()=>{
        console.log('listening on port 4000')       
    })
