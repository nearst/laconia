const { SSMClient, GetParametersCommand } = require("@aws-sdk/client-ssm");

const validateSsmData = data => {
  if (data.InvalidParameters.length > 0) {
    throw new Error(`Invalid parameters: ${data.InvalidParameters.join(", ")}`);
  }
};

module.exports = class SsmConfigConverter {
  constructor(ssm) {
    this.ssm = ssm || new SSMClient({});
  }

  async _getParameterMap(parameterNames) {
    const data = await this.ssm.send(
      new GetParametersCommand({
        Names: parameterNames,
        WithDecryption: true
      })
    );
    validateSsmData(data);
    return data.Parameters.reduce((acc, p) => {
      acc[p.Name] = p.Value;
      return acc;
    }, {});
  }

  async convertMultiple(values) {
    const parameterMap = await this._getParameterMap(Object.values(values));
    return Object.keys(values).reduce((acc, key) => {
      acc[key] = parameterMap[values[key]];
      return acc;
    }, {});
  }
};
