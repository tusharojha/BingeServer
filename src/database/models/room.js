// Library Imports
const mongoose = require("mongoose");

const userRoomSchema = mongoose.Schema({
  id: {
    type: String,
    require: true,
    unique: true,
  },
  name: {
    type: String,
    require: true,
  },
  avatar: {
    type: Number,
    require: true,
  },
});

const RoomSchema = mongoose.Schema({
  roomName: {
    type: String,
    require: true,
    minlength: 8,
    trim: true,
    unique: true,
  },
  idle: {
    type: Boolean,
    require: true,
    default: true,
  },
  winner: {
    type: String,
    require: false,
    default: null,
  },
  users: [userRoomSchema],
});

const Room = mongoose.model("rooms", RoomSchema);

module.exports = Room;
