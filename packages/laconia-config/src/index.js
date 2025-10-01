const EnvVarConfigFactory = require("./EnvVarConfigFactory");
const BooleanConfigConverter = require("./BooleanConfigConverter");
const IntegerConfigConverter = require("./IntegerConfigConverter");
const FloatConfigConverter = require("./FloatConfigConverter");
const SsmConfigConverter = require("./SsmConfigConverter");
const S3ConfigConverter = require("./S3ConfigConverter");
const SecretsManagerConfigConverter = require("./SecretsManagerConfigConverter");

exports.envVarInstances = () => ({ env }) =>
  new EnvVarConfigFactory(env, {
    boolean: new BooleanConfigConverter(),
    integer: new IntegerConfigConverter(),
    float: new FloatConfigConverter(),
    ssm: new SsmConfigConverter(),
    s3: new S3ConfigConverter(),
    secretsManager: new SecretsManagerConfigConverter()
  }).makeInstances();
