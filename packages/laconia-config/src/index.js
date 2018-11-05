const EnvVarConfigFactory = require("./EnvVarConfigFactory");
const BooleanConfigConverter = require("./BooleanConfigConverter");
const SsmConfigConverter = require("./SsmConfigConverter");
const S3ConfigConverter = require("./S3ConfigConverter");

exports.envVarInstances = () => ({ env, $ssm, $s3 }) =>
  new EnvVarConfigFactory(env, {
    boolean: new BooleanConfigConverter(),
    ssm: new SsmConfigConverter($ssm),
    s3: new S3ConfigConverter($s3)
  }).makeInstances();
