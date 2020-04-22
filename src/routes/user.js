// Library Imports
const express = require("express");
const _ = require("lodash");

// Project Imports
const { User } = require("./../database/models/models");

const router = express.Router();

router.post("/", (req, res) => {
  const { username, name, password } = _.pick(req.body, [
    "username",
    "name",
    "password",
  ]);
  var user = User({
    username,
    name,
    password,
  });

  user
    .save()
    .then(() => user.generateAuthToken())
    .then((token) =>
      res
        .status(201)
        .header("x-auth", token)
        .send(_.pick(user, ["_id", "username", "name"]))
    )
    .catch((e) => res.status(400).send(e));
});

module.exports = router;
