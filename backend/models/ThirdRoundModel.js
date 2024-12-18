const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThirdRoomSchema = new Schema({
    roomId: {
        type: String,
        required: true,
    },
    cards: [{
        card: {
            type: Object,
            required: true,
        },
        votes: {
            type: Object,
            default: {}, // Store votes as a regular object
        },
    }],
}, { timestamps: true });

module.exports = mongoose.model('third-round', ThirdRoomSchema);
