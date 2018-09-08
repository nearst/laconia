const EnvVarS3ConfigFactory = require("./EnvVarS3ConfigFactory");

exports.envVarInstances = () => ({ env }) =>
  new EnvVarS3ConfigFactory(env).makeInstances();
