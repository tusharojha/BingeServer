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
  YOU_ARE_HOST: "you are host",
  GAME_STARTED: "game started",
  BOARD_SET_TIMEOUT: "board set timeout",
  FIRST_MOVE: "first move",
};

module.exports = { ...listenrs, ...emits };
