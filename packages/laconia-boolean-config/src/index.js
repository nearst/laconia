const EnvVarBooleanConfigFactory = require("./EnvVarBooleanConfigFactory");

exports.envVarInstances = () => ({ env }) =>
  new EnvVarBooleanConfigFactory(env).makeInstances();
