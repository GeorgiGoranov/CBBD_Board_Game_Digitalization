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
            agree: {
                count: {
                    type: Number,
                    default: 0,
                },
                playerID: {
                    type: [String],
                    default: [],
                },
            },
            disagree: {
                count: {
                    type: Number,
                    default: 0,
                },
                playerID: {
                    type: [String],
                    default: [],
                },
            },
        },
    }],
}, { timestamps: true });

module.exports = mongoose.model('third-round', ThirdRoomSchema);
