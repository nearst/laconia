const { res, parseWebsocket } = require("@laconia/event").apigateway;

const websocketAdapter = app => async (...args) => {
  try {
    const output = await app(parseWebsocket(args));
    return res(output);
  } catch (err) {
    return res(err.message, 500);
  }
};

module.exports = websocketAdapter;
