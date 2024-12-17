const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  sender: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const GroupChatSchema = new Schema({
  groupNumber: {
    type: Number,
    required: true
  },
  messages: {
    type: [MessageSchema],
    default: []
  }
}, { _id: false });

const ChatRoomSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  groups: {
    type: [GroupChatSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);
