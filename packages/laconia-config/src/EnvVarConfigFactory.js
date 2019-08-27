const { EnvVarInstanceFactory } = require("@laconia/core");

const removeValueType = (valueType, rawInstance) =>
  rawInstance.replace(new RegExp(`^${valueType}:`), "");

const getValueType = rawInstance => {
  return rawInstance.split(":")[0];
};

const filterAndRemoveType = (type, typedValues) => {
  return Object.entries(typedValues)
    .filter(([name, value]) => getValueType(value) === type)
    .map(([name, value]) => [name, removeValueType(type, value)])
    .reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {});
};

module.exports = class EnvVarConfigFactory extends EnvVarInstanceFactory {
  constructor(env, converters) {
    super(env, "LACONIA_CONFIG_");
    this.converters = converters;
  }

  async makeInstances(options) {
    const typedValues = await super.makeInstances(options);
    if (Object.keys(typedValues).length === 0) return {};

    const types = Object.keys(this.converters);
    const conversionResults = await Promise.all(
      types.map(type => {
        const values = filterAndRemoveType(type, typedValues);
        return (
          Object.keys(values).length > 0 &&
          this.converters[type].convertMultiple(values)
        );
      })
    );
    return Object.assign({}, ...conversionResults);
  }
};
