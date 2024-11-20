
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  categories: {
    type: Array,
    default: [],
  },
  dropZones: {
    type: Map,
    of: Array,
    default: {
      box1: [],
      box2: [],
      box3: [],
      box4: [],
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('second-round', RoomSchema);
