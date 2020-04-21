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
  User({
    username,
    name,
    password,
  })
    .save()
    .then((doc) => res.status(201).send(_.pick(doc, ["_id", "username", "name"])))
    .catch((e) => res.status(400).send(e));
});

module.exports = router;
