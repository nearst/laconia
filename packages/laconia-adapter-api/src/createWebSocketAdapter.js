const { res, parseWebSocket } = require("@laconia/event").apigateway;

const createWebSocketAdapter = () => app => async event => {
  try {
    const output = await app(parseWebSocket(event));
    return res(output);
  } catch (err) {
    return res(err.message, 500);
  }
};

module.exports = createWebSocketAdapter;
