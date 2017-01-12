const http = require("https");

let config = require("../../config/development");

function hipchatEndpoint (roomId) {
  let hipchatRoom = config.hipchat.rooms[roomId];
  return `/v2/room/${hipchatRoom.roomId}/notification?auth_token=${hipchatRoom.token}`;
}

const HIPCHAT_MESSAGE_DEFAULTS = {
  "notify": false,
  "message_format": "html",
};

const HIPCHAT_HTTP_DEFAULTS = {
  hostname: config.hipchat.hostname,
  port: 443,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

function postMessage (options, roomId) {
  return new Promise((resolve) => {
    let path = hipchatEndpoint(roomId);
    let message = Object.assign({}, HIPCHAT_MESSAGE_DEFAULTS, options);
    let requestOptions = Object.assign({}, HIPCHAT_HTTP_DEFAULTS, { path });
    let hipchatRequest = http.request(requestOptions, function (response) {
      response.setEncoding("utf8");
      resolve();
    });

    hipchatRequest.write(JSON.stringify(message));
    hipchatRequest.end();
  });
}

module.exports = { postMessage };
