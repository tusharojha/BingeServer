var { User } = require("./../database/models/models");

var authenticate = (req, res, next) => {
  var token = req.header("x-auth");

  User.findByToken(token)
    .then((user) => {
      if (!user) {
        return Promise.reject();
      }

      req.user = user;
      req.token = token;
      next();
    })
    .catch((e) => {
      res.status(401).send();
    });
};

var authenticateSocket = (data) => {
  var token = data.token;
  return new Promise((resolve, reject) => {
    User.findByToken(token)
      .then((user) => {
        if (!user) {
          return Promise.reject();
        }

        data.token = token;
        return resolve(user);
      })
      .catch((e) => reject({ status: 401, message: "unauthorised" }));
  });
};

module.exports = { authenticate, authenticateSocket };
