const LaconiaTester = require("./LaconiaTester");
const { invoke } = require("laconia-core");

module.exports = (functionName, options) => {
  const invoker = invoke(functionName, options);
  invoker.requestLogs = true;
  return new LaconiaTester(invoker);
};
