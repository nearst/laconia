const EnvVarConfigFactory = require("./EnvVarConfigFactory");
const BooleanConverter = require("./BooleanConverter");
const SsmConverter = require("./SsmConverter");

exports.envVarInstances = () => ({ env, $ssm }) =>
  new EnvVarConfigFactory(env, {
    boolean: new BooleanConverter(),
    ssm: new SsmConverter($ssm)
  }).makeInstances();
