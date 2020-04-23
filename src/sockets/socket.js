// Library Imports
const socketIO = require("socket.io");

// Project Imports
const { CREATE_ROOM, JOIN_ROOM, EXIT_USER } = require("./events");
const { authenticateSocket } = require("./../middlewares/authenticate");

const createRoomName = () =>
  Math.floor(100000 + Math.random() * 90000000).toString();

const connectSockets = (server) => {
  var io = socketIO(server);

  // socket connection
  io.on("connection", (socket) => {
    console.log("New User Connected ");

    // User Disconnected
    socket.on("disconnect", () => {
      if (socket.user != null) console.log(`${socket.user.name} disconnected`);
      else console.log("User Disconnected");

    //   if (socket.rooms != null) {
    //     var rooms = socket.rooms;
    //     // remove the default room from the list
    //     rooms.splice(0, 1);

    //     rooms.forEach((room) => {
    //       socket.to(room).emit(EXIT_USER, { name: user.name, id: user._id });
    //     });
    //   }
    });

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
                socket.user = user;
                // console.log(io.nsps["/"].adapter.rooms[randomRoom].length);
                callback({ status: 201, message: "New room created" });
              } else {
                console.log(err);
                callback({ status: 501, message: "Error creating room" });
              }
            });
          } else {
            callback({
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

    // JOIN_ROOM event
    socket.on(JOIN_ROOM, (data, callback) => {
      authenticateSocket(data)
        .then((user) => {
          if (data.roomName != null) var roomName = data.roomName.toString();
          else callback({ status: 400, message: "Room Name is required" });
          if (io.nsps["/"].adapter.rooms[roomName] != undefined) {
            if (io.nsps["/"].adapter.rooms[roomName].length < 5) {
              socket.join(roomName, (err) => {
                if (!err) {
                  console.log("ROOM JOINED by ", user.name);
                  socket.user = user;
                  socket.to(roomName).broadcast.emit(`${user.name} Joined`);
                  callback({
                    status: 200,
                    message: "Room Joined successfully",
                  });
                }
              });
            } else {
              // TODO: change console.log to callback
              console.log({ status: 403, message: "Room is already full" });
            }
          } else {
            // TODO: change console.log to callback
            console.log({ status: 400, message: "Room does not exists" });
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
