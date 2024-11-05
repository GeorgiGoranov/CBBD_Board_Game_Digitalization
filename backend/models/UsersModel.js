const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true // if not picked the user name will become their name
    },
    email:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
    
    

}, { timestamps: true })

module.exports = mongoose.model('Users', userSchema)

