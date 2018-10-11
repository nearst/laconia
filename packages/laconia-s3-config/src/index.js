const EnvVarS3ConfigFactory = require("./EnvVarS3ConfigFactory");

exports.envVarInstances = () => ({ env, $s3 }) =>
  new EnvVarS3ConfigFactory(env, $s3).makeInstances();
