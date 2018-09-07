const EnvVarSsmConfigFactory = require("./EnvVarSsmConfigFactory");

exports.envVarInstances = () => ({ env }) =>
  new EnvVarSsmConfigFactory(env).makeInstances();
