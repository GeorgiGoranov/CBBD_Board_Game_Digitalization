const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // This adds createdAt and updatedAt fields
);

const ChatRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true, // Ensures one document per roomId
  },
  messages: [MessageSchema], // Array of messages
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);
