// Project Imports
const { START_GAME, GAME_STARTED, BOARD_SET_TIMEOUT, FIRST_MOVE } = require("./../events");
const { checkLoggedInUser, MOVE_TIMEOUT, BOARD_TIMEOUT } = require("./../commonMethods");
const { Room } = require("./../../database/models/models");

const SocketRoutes = (socket, io) => {
  // Socket Route to start the game (this route will be called by host only)
  socket.on(START_GAME, (data, callback) => {
    checkLoggedInUser(socket, callback)
      .then(() => {
        Room.findOneAndUpdate(
          {
            "users.id": socket.user._id,
            host: socket.user._id,
            roomName: data.roomName,
          },
          {
            $set: {
              idle: false,
            },
          }
        )
          .then((doc) => {
            if (doc != null) {
              // board timeoutset in emit is for app to start timer according to it
              // as in future we may increase/decrease it directly from server.
              socket.to(data.roomName).emit(GAME_STARTED, {
                status: 200,
                message: "game started",
                boardTimeOutSet: BOARD_TIMEOUT,
              });
              callback({
                status: 200,
                message: "game started",
                boardTimeOutSet: BOARD_TIMEOUT,
              });
              // Set Board Timeout for 60sec
              setTimeout(() => {
                // Emitting all other members of the room about timeout
                socket.to(data.roomName).emit(BOARD_SET_TIMEOUT, {
                  status: 200,
                  message: "board set timeout",
                });
                // Emitting host, to get ready for his/her first move
                socket.emit(FIRST_MOVE, {
                  status: 200,
                  message: "Board is set, Now it's your move",
                  timeout: MOVE_TIMEOUT,
                });
              }, BOARD_TIMEOUT * 1000);
            }
          })
          .catch((err) => {
            console.log("START_GAME_Error:", err);
          });
      })
      .catch((err) => console.log(err));
  });
};

module.exports = { SocketRoutes };
