const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    minlength: 3,
    require: true,
  },
  name: {
    type: String,
    unique: true,
    trim: true,
    minlength: 3,
    require: true,
  },
  password: {
    type: String,
    unique: true,
    trim: true,
    minlength: 6,
    require: true,
  },
  uuid: {
    type: String,
    default: null,
  },
  fcmToken: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("users", UserSchema);

module.exports = User;
