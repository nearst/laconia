const AWS = require("aws-sdk");
const LambdaInvoker = require("./LambdaInvoker");

module.exports = (
  functionName,
  { lambda = new AWS.Lambda(), requestLogs = false } = {}
) => {
  return new LambdaInvoker(functionName, lambda, requestLogs);
};
