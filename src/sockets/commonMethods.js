const checkLoggedInUser = (socket, callback) => {
  return new Promise((resolve, reject) => {
    if (socket.user != null) resolve();
    else callback({ status: 401, message: "unauthorised user" });
    return reject();
  });
};

// CONSTANTS
const MOVE_TIMEOUT = 10;
const BOARD_TIMEOUT = 60;

module.exports = { checkLoggedInUser };
