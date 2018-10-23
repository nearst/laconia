const EnvVarConfigFactory = require("./EnvVarConfigFactory");
const BooleanConverter = require("./BooleanConverter");
const SsmConverter = require("./SsmConverter");
const S3Converter = require("./S3Converter");

exports.envVarInstances = () => ({ env, $ssm, $s3 }) =>
  new EnvVarConfigFactory(env, {
    boolean: new BooleanConverter(),
    ssm: new SsmConverter($ssm),
    s3: new S3Converter($s3)
  }).makeInstances();
