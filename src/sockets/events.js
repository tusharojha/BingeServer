const listenrs = {
  CREATE_ROOM: "create room",
  CONNECT_GAME: "connect game",
  JOIN_ROOM: "join room",
  START_GAME: "start game",
};

const emits = {
  EXIT_ROOM: "exit user",
  MEMBER_LEFT: "member left",
  MEMBER_JOINED: "member joined",
  GAME_STARTED: "game started",
};

module.exports = { ...listenrs, ...emits };
