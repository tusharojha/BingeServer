// Library Imports
const express = require("express");
const _ = require("lodash");

// Project Imports
const { User } = require("./../database/models/models");
const {
  authenticate,
  authenticateSource,
} = require("./../middlewares/authenticate");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  res
    .status(201)
    .header("x-auth", req.token)
    .send(_.pick(req.user, ["name", "avatar", "bingeStars"]));
});

router.post("/", authenticateSource, (req, res) => {
  const { name, avatar, fcmToken } = _.pick(req.body, [
    "name",
    "avatar",
    "fcmToken",
  ]);
  var user = User({
    name,
    avatar,
    fcmToken,
  });

  user
    .save()
    .then(() => user.generateAuthToken())
    .then((token) =>
      res
        .status(201)
        .setHeader("x-auth", token)
        .send(_.pick(user, ["_id", "name"]))
    )
    .catch((e) => res.status(400).send(e));
});

router.patch("/", authenticate, (req, res) => {
  const { name, avatar, fcmToken } = _.pick(req.user, [
    "name",
    "avatar",
    "fcmToken",
  ]);

  User.findByToken(req.token).then((user) => {
    if (!user) {
      return res.status(401).send({ message: "User is not identified" });
    }

    var id = user.id;
    User.findOneAndUpdate(
      { _id: id },
      { $set: { name, avatar, fcmToken } },
      { new: true }
    ).then((doc) => {
      if (!doc) {
        return res
          .status(401)
          .header("x-auth", req.token)
          .send({ message: "User is not identified" });
      }
      res
        .status(200)
        .header("x-auth", req.token)
        .send(_.pick(doc, ["name", "avatar"]));
    });
  });
});

module.exports = router;
