const { res, parseWebSocket } = require("@laconia/event").apigateway;

const createWebSocketAdapter = () => app => async (...args) => {
  try {
    const output = await app(parseWebSocket(...args));
    return res(output);
  } catch (err) {
    return res(err.message, 500);
  }
};

module.exports = createWebSocketAdapter;
