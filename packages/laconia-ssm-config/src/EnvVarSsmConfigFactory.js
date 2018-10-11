const { EnvVarInstanceFactory } = require("@laconia/core");

module.exports = class EnvVarSsmConfigFactory extends EnvVarInstanceFactory {
  constructor(env, ssm) {
    super(env, "LACONIA_SSMCONFIG_");
    this.ssm = ssm;
  }

  async _getParameterMap(names) {
    const data = await this.ssm
      .getParameters({
        Names: names,
        WithDecryption: true
      })
      .promise();
    if (data.InvalidParameters.length > 0) {
      throw new Error(
        `Invalid parameters: ${data.InvalidParameters.join(", ")}`
      );
    }
    return data.Parameters.reduce((acc, p) => {
      acc[p.Name] = p.Value;
      return acc;
    }, {});
  }

  _makeInstance(value, options) {
    return this._parameterMap[value];
  }

  async _preMakeInstance(envVar) {
    this._parameterMap = await this._getParameterMap(Object.values(envVar));
  }
};
