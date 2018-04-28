const invoke = require("./invoke");
const recurse = require("./recurse");

module.exports = ({ event, context }) => {
  const core = { invoke, recurse, env: process.env };
  const lambda = { event, context };
  return Object.assign(lambda, core);
};
