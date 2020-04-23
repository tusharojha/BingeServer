const listenrs = {
  CREATE_ROOM: "create room",
  CONNECT_GAME: "connect game",
  JOIN_ROOM: "join room",
};

const emits = {
  EXIT_ROOM: "exit user",
};

module.exports = { ...listenrs, ...emits };
