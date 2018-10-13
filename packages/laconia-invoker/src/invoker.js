const LambdaInvoker = require("./LambdaInvoker");

module.exports = (functionName, lambda, { requestLogs = false } = {}) => {
  return new LambdaInvoker(functionName, lambda, requestLogs);
};
