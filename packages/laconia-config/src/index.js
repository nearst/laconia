const EnvVarConfigFactory = require("./EnvVarConfigFactory");
const BooleanConfigConverter = require("./BooleanConfigConverter");
const SsmConfigConverter = require("./SsmConfigConverter");
const S3ConfigConverter = require("./S3ConfigConverter");
const SecretsManagerConfigConverter = require("./SecretsManagerConfigConverter");

exports.envVarInstances = () => ({ env, $ssm, $s3, $secretsManager }) =>
  new EnvVarConfigFactory(env, {
    boolean: new BooleanConfigConverter(),
    ssm: new SsmConfigConverter($ssm),
    s3: new S3ConfigConverter($s3),
    secretsManager: new SecretsManagerConfigConverter($secretsManager)
  }).makeInstances();
