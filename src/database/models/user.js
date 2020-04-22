// Library Imports
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    trim: true,
    minlength: 3,
    require: true,
  },
  password: {
    type: String,
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
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// generating auth token\
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, "slkfjslkfjsdlkfjs")
    .toString();
  user.tokens.push({ access, token });

  return user.save().then(() => token);
};

// Hashing User Password | Security
UserSchema.pre("save", function (next) {
  var user = this;
  try {
    if (user.isModified("password")) {
      bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(user.password, salt, (err, encryptedPassword) => {
          user.password = encryptedPassword;
          next();
        });
      });
    } else {
      next();
    }
  } catch (e) {
    console.log(e);
    next();
  }
});

const User = mongoose.model("users", UserSchema);

module.exports = User;
