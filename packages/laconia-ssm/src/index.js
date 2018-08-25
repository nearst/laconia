const EnvVarSsmFactory = require("./EnvVarSsmFactory");

exports.envVarInstances = ({ env }) =>
  new EnvVarSsmFactory(env).makeInstances();
