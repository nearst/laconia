const validateSsmData = data => {
  if (data.InvalidParameters.length > 0) {
    throw new Error(`Invalid parameters: ${data.InvalidParameters.join(", ")}`);
  }
};

module.exports = class SsmConfigConverter {
  constructor(ssm) {
    this.ssm = ssm;
  }

  async _getParameterMap(parameterNames) {
    const data = await this.ssm
      .getParameters({
        Names: parameterNames,
        WithDecryption: true
      })
      .promise();
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
