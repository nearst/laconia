const AWS = require("aws-sdk");

const macroCaseToCamelCase = str =>
  str.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());

const toObjKey = envKey =>
  macroCaseToCamelCase(envKey.replace("LACONIA_SSM_", ""));

module.exports = class EnvVarSsmSecretFactory {
  constructor(env, { ssm = new AWS.SSM() } = {}) {
    this.env = env;
    this.ssm = ssm;
  }

  _getEnvVar() {
    return Object.keys(this.env)
      .filter(k => k.startsWith("LACONIA_SSM"))
      .reduce((envVar, k) => {
        envVar[k] = this.env[k];
        return envVar;
      }, {});
  }

  async _getParameterMap(names) {
    const data = await this.ssm
      .getParameters({
        Names: names,
        WithDecryption: true
      })
      .promise();
    if (data.InvalidParameters.length > 0) {
      throw new Error(data.InvalidParameters);
    }
    return data.Parameters.reduce((acc, p) => {
      acc[p.Name] = p.Value;
      return acc;
    }, {});
  }

  async makeInstances() {
    const envVar = this._getEnvVar();
    const parameterMap = await this._getParameterMap(Object.values(envVar));

    return Object.keys(envVar).reduce((acc, envKey) => {
      acc[toObjKey(envKey)] = parameterMap[envVar[envKey]];
      return acc;
    }, {});
  }
};
