const EnvVarInvokeFactory = require("./EnvVarInvokeFactory");

module.exports.invoke = require("./invoke");
module.exports.HandledInvokeLaconiaError = require("./HandledInvokeLaconiaError");
module.exports.UnhandledInvokeLaconiaError = require("./UnhandledInvokeLaconiaError");

module.exports.instances = ({ env }) =>
  new EnvVarInvokeFactory(env).makeInstances();
