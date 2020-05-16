// Project Imports
const {
  START_GAME,
  GAME_STARTED,
  BOARD_SET_TIMEOUT,
  FIRST_MOVE,
  NEXT_MOVE,
  YOUR_MOVE,
  CROSS_NUMBER,
  SKIP_MOVE,
  WINNING_MOVE,
  WINNER_ANOUNCE,
} = require("./../events");
const {
  checkLoggedInUser,
  whoIsNext,
  MOVE_TIMEOUT,
  BOARD_TIMEOUT,
} = require("./../commonMethods");
const { Room } = require("./../../database/models/models");

const SocketRoutes = (socket, io) => {
  // Socket Route to start the game (this route will be called by host only)
  socket.on(START_GAME, (data, callback) => {
    // Expected data: {roomName: '29389293'}
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
              }, 60 * 1000);
            }
          })
          .catch((err) => {
            console.log("START_GAME_Error:", err);
          });
      })
      .catch((err) => console.log(err));
  });

  // Socket Route for winning move
  socket.on(WINNING_MOVE, (data, callback) => {
    /* expected data : {roomName: '65342312', board: [
       [1, 2, 3, 4, 6],
       [7, 8, 9 ,10 ,11],
       [12, 13, 14, 15, 16],
       [17, 18, 19, 20, 21],
       [22, 23, 24, 25, 5]]
      */
    checkLoggedInUser(socket, callback)
      .then(() => {
        if (data.roomName != null && data.board != null) {
          Room.findOne({
            roomName: data.roomName,
            "users.id": socket.user._id.toString(),
          }).then((doc) => {
            if (doc != null) {
              io.to(data.roomName).emit(WINNER_ANOUNCE, {
                winner: {
                  id: socket.user._id,
                  name: socket.user.name,
                  avatar: socket.user.avatar,
                },
                board: data.board,
              });
            } else {
              callback({ status: 500, message: "Internal Server Error" });
            }
          });
        } else {
          callback({ status: 400, message: "Bad Request" });
        }
      })
      .catch((err) => console.log(err));
  });

  // Socket Route for skipping move
  socket.on(SKIP_MOVE, (data, callback) => {
    // Expected data: {roomName: '29389293'}
    checkLoggedInUser(socket, callback)
      .then(() => {
        if (data.roomName != null) {
          Room.findOne({ roomName: data.roomName })
            .then((doc) => {
              if (doc != null) {
                // fetching next user whose turn is this
                const nextUser = whoIsNext(
                  socket.user._id.toString(),
                  doc.users
                );
                // emiting to the user about his turn
                io.to(nextUser.socketID).emit(YOUR_MOVE, {
                  status: 200,
                  message: "It's your turn",
                });
              } else {
                callback({ status: 500, message: "Internal Server Error" });
              }
            })
            .catch((err) => {
              console.log("FINDING_ROOM_SKIP_MOVE ERROR:", err);
            });
        } else {
          callback({ status: 400, message: "bad request" });
        }
      })
      .catch((err) => console.log("SKIP_MOVE ERROR:", err));
  });

  // Socket Route for next move
  socket.on(NEXT_MOVE, (data, callback) => {
    // Expected data: {roomName: '29389293', crossNumber: 12}
    checkLoggedInUser(socket, callback)
      .then(() => {
        if (data.crossNumber != null && data.roomName != null) {
          const crossNumber = Number.parseInt(data.crossNumber);
          Room.findOneAndUpdate(
            {
              roomName: data.roomName,
              "users.id": socket.user._id.toString(),
              idle: false,
            },
            {
              $pull: {
                remainingNumbers: crossNumber,
              },
            }
          )
            .then((doc) => {
              if (doc != null) {
                if (doc.remainingNumbers.includes(crossNumber)) {
                  // Number was present in the remaining list before i.e. everything is fine
                  // Broadcasting user's move to other members
                  socket.broadcast.emit(CROSS_NUMBER, {
                    status: 200,
                    crossNumber: crossNumber,
                    user: {
                      id: socket.user._id,
                      name: socket.user.name,
                      avatar: socket.user.avatar,
                    },
                  });
                  // fetching next user whose turn is this
                  const nextUser = whoIsNext(
                    socket.user._id.toString(),
                    doc.users
                  );
                  // emiting to the user about his turn
                  io.to(nextUser.socketID).emit(YOUR_MOVE, {
                    status: 200,
                    message: "It's your turn",
                  });
                } else {
                  // Number was not present in the remaining list before i.e. someone already crossed it
                  callback({
                    status: 400,
                    message: "number was already crossed",
                  });
                  console.log({
                    status: 400,
                    message: "number was already crossed",
                  });
                }
              } else {
                callback({ status: 500, message: "Internal Server Error" });
              }
            })
            .catch((err) => {
              console.log("ERROR_UPDATING_MOVE:", err);
            });
        } else {
          callback({ status: 400, message: "bad request" });
        }
      })
      .catch((err) => console.log(err));
  });
};

module.exports = { SocketRoutes };
