// Project Imports
const { START_GAME, GAME_STARTED } = require("./../events");
const { checkLoggedInUser } = require("./../commonMethods");
const { Room } = require("./../../database/models/models");

const SocketRoutes = (socket) => {
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
              socket.to(data.roomName).emit(GAME_STARTED, {
                status: 200,
                message: "game started",
              });
              callback({
                status: 200,
                message: "game started",
              });
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
