const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    options: {
        en: {
            type: String,
            required: true,
        },
    },
}, { timestamps: true });

// Explicitly specify the collection name
const Profile = mongoose.model('Profile', profileSchema, 'profiles-data');

module.exports = Profile;
