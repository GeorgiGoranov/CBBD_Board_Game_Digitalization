const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cardSchema = new Schema({

    name: { 
        type: String, 
        required: true, 
        unique: true 
    }, // 6-digit code
    role:{
        type: String,
        required: true
    },
    host: { 
        type: String,
        required: true 
    }, // Moderator/host of the session
    createdAt: { 
        type: Date, 
        default: Date.now 
    } // Timestamp for session creation

})

module.exports = mongoose.model('Cards', cardSchema)