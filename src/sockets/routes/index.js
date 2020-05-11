// Project Imports
const { START_GAME, GAME_STARTED, BOARD_SET_TIMEOUT } = require("./../events");
const { checkLoggedInUser } = require("./../commonMethods");
const { Room } = require("./../../database/models/models");

const SocketRoutes = (socket, io) => {
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
                boardTimeOutSet: 60,
              });
              callback({
                status: 200,
                message: "game started",
                boardTimeOutSet: 60,
              });
              // Set Board Timeout for 60sec
              setTimeout(() => {
                io.in(data.roomName).emit(BOARD_SET_TIMEOUT, {
                  status: 200,
                  message: "board set timeout",
                });
              }, 60 * 1000);
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
