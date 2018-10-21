const { EnvVarInstanceFactory } = require("@laconia/core");

const removeValueTypePrefix = (valueType, rawInstance) =>
  rawInstance.replace(new RegExp(`^${valueType}:`), "");

const getValueType = rawInstance => {
  return rawInstance.split(":")[0];
};

const distributeToMap = (valueTypes, rawInstances) => {
  const valueTypeToInstancesMap = new Map(valueTypes.map(v => [v, {}]));

  for (const [instanceName, rawInstance] of Object.entries(rawInstances)) {
    const valueType = getValueType(rawInstance);
    const instances = valueTypeToInstancesMap.get(valueType);
    instances[instanceName] = removeValueTypePrefix(valueType, rawInstance);
  }

  return valueTypeToInstancesMap;
};

module.exports = class EnvVarConfigFactory extends EnvVarInstanceFactory {
  constructor(env, factoryMap) {
    super(env, "LACONIA_CONFIG_");
    this.factoryMap = factoryMap;
  }

  _makeValueTypeInstances(valueTypes, valueTypeToInstancesMap) {
    return Promise.all(
      valueTypes.map(valueType =>
        this.factoryMap[valueType].makeInstances(
          valueTypeToInstancesMap.get(valueType)
        )
      )
    );
  }

  async makeInstances(options) {
    const rawInstances = await super.makeInstances(options);
    if (Object.keys(rawInstances).length === 0) return {};

    const valueTypes = Object.keys(this.factoryMap);
    const valueTypeToInstancesMap = distributeToMap(valueTypes, rawInstances);
    const valueTypeInstances = await this._makeValueTypeInstances(
      valueTypes,
      valueTypeToInstancesMap
    );
    return Object.assign({}, ...valueTypeInstances);
  }
};
