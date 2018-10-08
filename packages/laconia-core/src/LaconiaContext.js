const prefixKeys = (prefix, object) => {
  const keyValues = Object.keys(object).map(key => {
    const newKey = `${prefix}${key}`;
    return { [newKey]: object[key] };
  });
  return Object.assign({}, ...keyValues);
};

const parallelFactoryFns = factoryFns => async (...args) => {
  const responses = await Promise.all(factoryFns.map(f => f(...args)));
  return responses.reduce(
    (allInstances, instances) => Object.assign(allInstances, instances),
    {}
  );
};

module.exports = class LaconiaContext {
  constructor(baseContext) {
    this.registerInstances(baseContext);
    this._factoryFns = [];
    this._postProcessorFns = [];
  }

  registerInstances(instances) {
    Object.keys(instances).forEach(key => {
      this[key] = instances[key];
    });
  }

  registerFactory(factory, options = {}) {
    this._factoryFns.push(factory);
  }

  registerFactories(factories, options = {}) {
    this.registerFactory(parallelFactoryFns(factories), options);
  }

  registerPostProcessor(postProcessor) {
    this._postProcessorFns.push(postProcessor);
  }

  async refresh() {
    for (const factoryFn of this._factoryFns) {
      this.registerInstances(await factoryFn(this));
    }

    for (const postProcessorFn of this._postProcessorFns) {
      postProcessorFn(this);
    }
  }

  _registerInstancesWithPrefix(instances) {
    this.registerInstances(prefixKeys("$", instances));
  }
};
