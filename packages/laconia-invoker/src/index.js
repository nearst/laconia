const AWS = require("aws-sdk");
const invoker = require("./invoker");
const HandledInvokeLaconiaError = require("./HandledInvokeLaconiaError");
const UnhandledInvokeLaconiaError = require("./UnhandledInvokeLaconiaError");
const EnvVarInvokerFactory = require("./EnvVarInvokerFactory");

module.exports = exports = invoker;
exports.default = invoker;

exports.HandledInvokeLaconiaError = HandledInvokeLaconiaError;
exports.UnhandledInvokeLaconiaError = UnhandledInvokeLaconiaError;
exports.envVarInstances = () => ({ env, $lambda = new AWS.Lambda() } = {}) =>
  new EnvVarInvokerFactory(env).makeInstances({ lambda: $lambda });
