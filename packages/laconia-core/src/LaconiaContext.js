const prefixKeys = (prefix, object) => {
  const keyValues = Object.keys(object).map(key => {
    const newKey = `${prefix}${key}`;
    return { [newKey]: object[key] };
  });
  return Object.assign({}, ...keyValues);
};

module.exports = class LaconiaContext {
  constructor(baseContext) {
    this.registerInstances(baseContext);
    this._factoryFns = [];
  }

  registerInstances(instances) {
    Object.keys(instances).forEach(key => {
      this[key] = instances[key];
    });
  }

  registerFactory(factory) {
    this._factoryFns.push(factory);
  }

  async refresh() {
    for (const factoryFn of this._factoryFns) {
      this.registerInstances(await factoryFn(this));
    }
  }

  _registerInstancesWithPrefix(instances) {
    this.registerInstances(prefixKeys("$", instances));
  }
};
