
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
      priority1: [],
      priority2: [],
      priority3: [],
      priority4: [],
    }
  },
  messages: {
    type: Array,
    default: []
  },
  nationalities: {
    type: Array,
    default: []
  },

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
