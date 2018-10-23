module.exports = class SsmConverter {
  constructor(ssm) {
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

  async convertMultiple(values) {
    const parameterMap = await this._getParameterMap(Object.values(values));
    return Object.keys(values).reduce((acc, value) => {
      acc[value] = parameterMap[values[value]];
      return acc;
    }, {});
  }
};
