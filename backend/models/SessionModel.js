const mongoose = require('mongoose')

const Schema = mongoose.Schema

const sessionSchema = new Schema({

    code: { 
        type: String, 
        required: true, 
        unique: true 
    }, // 6-digit code
    host: { 
        type: String,
        required: true 
    }, // Moderator/host of the session
    players: [{
        type: String 
    }], // List of player names or IDs
    isActive: { 
        type: Boolean,
        default: true 
    }, // Whether the session is ongoing
    createdAt: { 
        type: Date, 
        default: Date.now 
    } // Timestamp for session creation

})

module.exports = mongoose.model('GameSession', sessionSchema)