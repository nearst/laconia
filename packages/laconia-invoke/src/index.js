const invoke = require("./invoke");
const HandledInvokeLaconiaError = require("./HandledInvokeLaconiaError");
const UnhandledInvokeLaconiaError = require("./UnhandledInvokeLaconiaError");
const EnvVarInvokeFactory = require("./EnvVarInvokeFactory");

module.exports = exports = invoke;
exports.default = invoke;

exports.HandledInvokeLaconiaError = HandledInvokeLaconiaError;
exports.UnhandledInvokeLaconiaError = UnhandledInvokeLaconiaError;
exports.envVarInstances = () => ({ env }) =>
  new EnvVarInvokeFactory(env).makeInstances();
