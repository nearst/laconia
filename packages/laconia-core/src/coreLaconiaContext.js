const invoke = require("./invoke");
const recurse = require("./recurse");

module.exports = laconiaContext => {
  const coreLaconiaContext = {
    invoke,
    recurse: recurse(laconiaContext),
    env: process.env
  };
  return Object.assign({}, laconiaContext, coreLaconiaContext);
};
