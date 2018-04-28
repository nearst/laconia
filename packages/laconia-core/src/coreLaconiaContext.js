const invoke = require("./invoke");

module.exports = ({ event, context }) => {
  return Object.assign({ event, context }, { invoke });
};
