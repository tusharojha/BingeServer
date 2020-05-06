// Library Imports
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Project Imports
const { TOKEN_SALT } = require("./../../config/config");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: 3,
    require: true,
  },
  fcmToken: {
    type: String,
    default: null,
  },
  avatar: {
    type: Number,
    default: 0
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// generating auth token
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, TOKEN_SALT)
    .toString();
  user.tokens.push({ access, token });

  return user.save().then(() => token);
};

// find by token
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, TOKEN_SALT);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

const User = mongoose.model("users", UserSchema);

module.exports = User;
