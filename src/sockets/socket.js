// Library Imports
const socketIO = require("socket.io");

// Project Imports
const { CREATE_ROOM, JOIN_ROOM, EXIT_USER } = require("./events");
const { authenticateSocket } = require("./../middlewares/authenticate");
const { Room } = require("../database/models/models");

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
            Room.findOne({ "users.id": user._id.toString() }).then((doc) => {
              if (doc == null) {
                socket.join(randomRoom, (err) => {
                  if (!err) {
                    socket.user = user;
                    var room = Room({
                      roomName: randomRoom,
                      users: [
                        { id: user._id, name: user.name, avatar: user.avatar },
                      ],
                    });
                    room
                      .save()
                      .then(() => {
                        console.log("ROOM CREATED: ", randomRoom);
                        callback({
                          status: 201,
                          message: "New room created",
                          data: {
                            roomName: randomRoom,
                            user: {
                              id: user._id,
                              name: user.name,
                              avatar: user.avatar,
                            },
                          },
                        });
                      })
                      .catch((err) => {
                        console.log("Error: ", err);
                        callback({ status: 501, message: err });
                      });
                    // console.log(io.nsps["/"].adapter.rooms[randomRoom].length);
                  } else {
                    console.log(err);
                    callback({ status: 501, message: "Error creating room" });
                  }
                });
              } else {
                console.log("User is already in a room!");
                callback({ status: 400, message: "User is already in a room" });
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
          // finding the room in database
          Room.findOne({ roomName: roomName })
            .then((doc) => {
              // checking for necessary conditions to enter room
              if (
                io.nsps["/"].adapter.rooms[roomName] != undefined &&
                doc != null
              ) {
                if (
                  io.nsps["/"].adapter.rooms[roomName].length < 5 &&
                  doc.users.length < 5
                ) {
                  socket.join(roomName, (err) => {
                    if (!err) {
                      // Add the user to the table
                      Room.findOneAndUpdate(
                        { roomName: roomName },
                        {
                          $set: {
                            users: [
                              ...doc.users,
                              {
                                id: user._id,
                                name: user.name,
                                avatar: user.avatar,
                              },
                            ],
                          },
                        },
                        { new: true }
                      )
                        .then((newDoc) => {
                          console.log("ROOM JOINED by ", user.name);
                          socket.user = user;
                          // Notifies existing room members about the new joining
                          socket.to(roomName).broadcast.emit({
                            message: `${user.name} Joined`,
                            user: {
                              id: user._id,
                              name: user.name,
                              avatar: user.avatar,
                            },
                          });
                          // send the list of users present in the room to the new user
                          callback({
                            status: 200,
                            message: "Room Joined successfully",
                            self: {
                              id: user._id,
                              name: user.name,
                              avatar: user.avatar,
                            },
                            users: newDoc.users,
                          });
                        })
                        .catch((err) => {
                          console.log(err);
                          callback({
                            status: 500,
                            message: "Internal Server Error",
                          });
                        });
                    } else {
                      console.log(err);
                      callback({
                        status: 500,
                        message: "Internal Server Error",
                      });
                    }
                  });
                } else {
                  // TODO: change console.log to callback
                  callback({ status: 403, message: "Room is already full" });
                }
              } else {
                // TODO: change console.log to callback
                console.log({ status: 400, message: "Room does not exists" });
              }
            })
            .catch((err) => {
              console.log(err);
              callback({ status: 400, message: err });
            });
        })
        .catch((e) => {
          console.log(e);
          callback(e);
        });
    });
  });
};

module.exports = { connectSockets };
