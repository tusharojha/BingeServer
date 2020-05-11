const checkLoggedInUser = (socket, callback) => {
  return new Promise((resolve, reject) => {
    if (socket.user != null) resolve();
    else callback({ status: 401, message: "unauthorised user" });
    return reject();
  });
};

module.exports = { checkLoggedInUser };
