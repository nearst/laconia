const EnvVarSsmConfigFactory = require("./EnvVarSsmConfigFactory");

exports.envVarInstances = () => ({ env, $ssm }) =>
  new EnvVarSsmConfigFactory(env, $ssm).makeInstances();
