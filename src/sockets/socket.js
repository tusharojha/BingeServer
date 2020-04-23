// Library Imports
const socketIO = require("socket.io");

// Project Imports
const { CREATE_ROOM, CONNECT_GAME } = require("./events");
const { authenticateSocket } = require("./../middlewares/authenticate");

const createRoomName = () =>
  Math.floor(100000 + Math.random() * 90000000).toString();

const connectSockets = (server) => {
  var io = socketIO(server);

  // socket connection
  io.on("connection", (socket) => {
    console.log("New User Connected ");

    // User Disconnected
    socket.on("disconnect", () => console.log("User Disconnected"));

    // CREATE_ROOM event added with authentication
    socket.on(CREATE_ROOM, (data, callback) => {
      authenticateSocket(data)
        .then((user) => {
          var randomRoom = createRoomName();
          if (
            io.nsps["/"].adapter.rooms[randomRoom] === undefined ||
            io.nsps["/"].adapter.rooms[randomRoom].length < 1
          ) {
            socket.join(randomRoom, (err) => {
              if (!err) {
                console.log("ROOM CREATED: ", randomRoom);
                // console.log(io.nsps["/"].adapter.rooms[randomRoom].length);
                callback({ status: 201, message: "New room created" });
              } else {
                console.log(err);
                callback({ status: 501, message: "Error creating room" });
              }
            });
          } else {
            console.log({
              status: 501,
              message: "Unable to create room, please try again.",
            });
          }
        })
        .catch((e) => {
          console.log(e);
          callback(e);
        });
    });
  });
};

module.exports = { connectSockets };
