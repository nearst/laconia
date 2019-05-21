const getBody = require("./getBody");
const tryParseJson = require("../tryParseJson");

module.exports = event => {
  const body = getBody(event);
  return tryParseJson(body);
};
