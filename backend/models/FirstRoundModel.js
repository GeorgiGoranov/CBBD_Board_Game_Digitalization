
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  groupNumber: {
    type: Number,
    required: true
  },
  categories: {
    type: Array,
    default: []
  },
  dropZones: {
    type: Map,
    of: Array,
    default: {
      box1: [],
      box2: [],
      box3: [],
      box4: [],
    }
  },
  messages: {
    type: Array,
    default: []
  }
}, { _id: false });

const FirstRoomSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  groups: {
    type: [GroupSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('first-round', FirstRoomSchema);
