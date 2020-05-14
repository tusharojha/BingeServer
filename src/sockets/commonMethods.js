const checkLoggedInUser = (socket, callback) => {
  return new Promise((resolve, reject) => {
    if (socket.user != null) resolve();
    else callback({ status: 401, message: "unauthorised user" });
    return reject();
  });
};

const whoIsNext = (id, users) => {
  const index = users.findIndex((user)=>user.id === id);
  var nextIndex;
  if(users.length === (index+1)){
    nextIndex = 0;
  }else{
    nextIndex = index + 1;
  }
  return users[nextIndex];
};

// CONSTANTS
const MOVE_TIMEOUT = 10;
const BOARD_TIMEOUT = 60;

module.exports = { checkLoggedInUser, whoIsNext };
