const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cardSchema = new Schema({

    category: {
        type: String,
        required: true,
        unique: true // Ensure that category is unique, not name
    },
    options: {
        nl: { type: String, required: true },
        de: { type: String, required: true }
    },
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
    }, // Timestamp for session creation

})

module.exports = mongoose.model('Cards', cardSchema)