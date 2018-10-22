const EnvVarConfigFactory = require("./EnvVarConfigFactory");
const BooleanConverter = require("./BooleanConverter");

exports.envVarInstances = () => ({ env }) =>
  new EnvVarConfigFactory(env, {
    boolean: new BooleanConverter()
  }).makeInstances();
