const listenrs = {
  CREATE_ROOM: "create room",
  CONNECT_GAME: "connect game",
  JOIN_ROOM: "join room",
};

const emits = {
  EXIT_ROOM: "exit user",
  MEMBER_LEFT: "member left",
  MEMBER_JOINED: "member joined"
};

module.exports = { ...listenrs, ...emits };
