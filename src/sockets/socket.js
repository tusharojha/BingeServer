// Library Imports
const socketIO = require("socket.io");

// Project Imports
const {
  CREATE_ROOM,
  JOIN_ROOM,
  MEMBER_LEFT,
  MEMBER_JOINED,
  YOU_ARE_HOST,
} = require("./events");
const { authenticateSocket } = require("./../middlewares/authenticate");
const { Room } = require("../database/models/models");
const { SocketRoutes } = require("./routes");

// Method for generating 8 digit room name
const createRoomName = () =>
  Math.floor(10000000 + Math.random() * 90000000).toString();

const connectSockets = (server) => {
  var io = socketIO(server);

  // socket connection
  io.on("connection", (socket) => {
    console.log("New User Connected ");

    // Socket Routes for gameplay
    SocketRoutes(socket, io);

    // User Disconnected
    socket.on("disconnect", () => {
      // check if user was connect to any room
      if (socket.user != null) {
        // finding the room in which user is present
        Room.findOne({ "users.id": socket.user._id })
          .then((doc) => {
            if (doc != null) {
              // if number of room members is more than 1, it means someone is still in the room
              if (doc.users.length > 1) {
                // Checking if the user left was host or not
                if (doc.host === socket.user._id.toString()) {
                  // fetching a new host
                  var newHost = doc.users.filter((item) => (item.id != socket.user._id.toString()));
                  // pulling out the user from the room & setting up new host
                  Room.updateOne(
                    { "users.id": socket.user._id, host: socket.user._id.toString() },
                    {
                      $pull: {
                        users: { id: socket.user._id.toString() },
                      },
                      $set: {
                        host: newHost[0].id,
                      },
                    }
                  )
                    .then((newDoc) => {
                      if (newDoc != null) {
                        // TODO: remove this console statement after testing
                        console.log(`${socket.user.name} disconnected`);

                        // Notifing the members that the user left
                        socket.to(socket.roomName).broadcast.emit(MEMBER_LEFT, {
                          status: 200,
                          user: {
                            id: socket.user._id,
                            name: socket.user.name,
                            avatar: socket.user.avatar,
                          },
                        });

                        // Emitting the new host that you are host now
                        io.to(newHost[0].socketID).emit(YOU_ARE_HOST, {
                          status: 200,
                          message: "You are host now!",
                        });
                      } else {
                        console.log("Error while removing user from db", err);
                      }
                    })
                    .catch((err) => {
                      console.log("Error while updating:", doc);
                    });
                } else {
                  // pulling out the user from the room
                  Room.updateOne(
                    { "users.id": socket.user._id },
                    {
                      $pull: {
                        users: { id: socket.user._id.toString() },
                      },
                    }
                  )
                    .then((doc) => {
                      if (doc != null) {
                        // TODO: remove this console statement after testing
                        console.log(`${socket.user.name} disconnected`);

                        // Notifing the members that the user left
                        socket.to(socket.roomName).broadcast.emit(MEMBER_LEFT, {
                          status: 200,
                          user: {
                            id: socket.user._id,
                            name: socket.user.name,
                            avatar: socket.user.avatar,
                          },
                        });
                      } else {
                        console.log("Error while removing user from db", err);
                      }
                    })
                    .catch((err) => {
                      console.log("Error while updating:", doc);
                    });
                }
              } else {
                // If user was the last member of the room, we free up space by deleting the room.
                Room.deleteOne({ _id: doc._id })
                  .then((doc) => {
                    // TODO: Delete this if-else clause after testing.
                    if (doc != null) {
                      console.log("Room Deleted Successfully");
                    } else {
                      console.log("Unable to delete room");
                    }
                  })
                  .catch((err) => {
                    console.log("Error while deleting room:", err);
                  });
              }
            } else {
              // TODO: Remove this else clause after testing
              console.log("User was not in any room, Disconnected...");
            }
          })
          .catch((err) => {
            console.log("Disconnecting Error:", err);
          });
      } else {
        console.log("User Disconnected");
      }
    });

    // CREATE_ROOM event added with authentication
    socket.on(CREATE_ROOM, (data, callback) => {
      // authenticating user
      authenticateSocket(data)
        .then((user) => {
          // generating a random room name
          var randomRoom = createRoomName();
          // check if room is not already taken
          if (
            io.sockets.adapter.rooms[randomRoom] === undefined ||
            io.sockets.adapter.rooms[randomRoom].length < 1
          ) {
            // checking if user was not already in a room
            Room.findOne({ "users.id": user._id.toString() }).then((doc) => {
              if (doc == null) {
                // creating the room & saving to database
                const err = socket.join(randomRoom);
                if (!err) {
                  socket.user = user;
                  socket.roomName = randomRoom;
                  var room = Room({
                    roomName: randomRoom,
                    host: user._id,
                    users: [
                      {
                        id: user._id,
                        name: user.name,
                        avatar: user.avatar,
                        socketID: socket.id,
                      },
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
                } else {
                  console.log(err);
                  callback({ status: 501, message: "Error creating room" });
                }
              } else {
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
              if (io.sockets.adapter.rooms.get(roomName) != null &&
                doc != null
              ) {
                if (
                  io.sockets.adapter.rooms.get(roomName).size < 5 &&
                  doc.users.length < 5
                ) {
                  const err = socket.join(roomName);
                  if (!err) {
                    // Add the user to the table
                    Room.findOneAndUpdate(
                      { roomName: roomName },
                      {
                        $addToSet: {
                          users: {
                            id: user._id,
                            name: user.name,
                            avatar: user.avatar,
                            socketID: socket.id,
                          },
                        },
                      },
                      { new: true }
                    )
                      .then((newDoc) => {
                        console.log("ROOM JOINED by ", user.name);
                        socket.user = user;
                        socket.roomName = roomName;
                        // Notifies existing room members about the new joining
                        socket.to(roomName).emit(MEMBER_JOINED, {
                          status: 200,
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
