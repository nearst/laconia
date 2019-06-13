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

const JEST_INJECTED_PROPERTY = "asymmetricMatch";
const CONSOLE_LOG_PROPERTIES = [
  "inspect",
  "Symbol(util.inspect.custom)",
  "Symbol(Symbol.iterator)",
  "Symbol(Symbol.toStringTag)"
];
const JSON_STRINGIFY_PROPERTY = "toJSON";
const ignoredProperties = [
  JEST_INJECTED_PROPERTY,
  JSON_STRINGIFY_PROPERTY,
  ...CONSOLE_LOG_PROPERTIES
];

const checkInstanceName = (laconiaContext, instanceName) => {
  if (!ignoredProperties.includes(instanceName.toString())) {
    throw new Error(
      `The dependency ${instanceName} is not available. Have you registered your dependency? These are the dependencies available in LaconiaContext: ${Object.getOwnPropertyNames(
        laconiaContext
      ).join(", ")}`
    );
  }
};

const validInstanceNameHandler = {
  get: (laconiaContext, instanceName) => {
    if (instanceName in laconiaContext) {
      return laconiaContext[instanceName];
    } else {
      checkInstanceName(laconiaContext, instanceName);
    }
  }
};

const factoryFns = Symbol("factoryFns");
const postProcessorFns = Symbol("postProcessorFns");

module.exports = class LaconiaContext {
  constructor() {
    this[factoryFns] = [];
    this[postProcessorFns] = [];
    return new Proxy(this, validInstanceNameHandler);
  }

  registerInstances(instances) {
    Object.keys(instances).forEach(key => {
      this[key] = instances[key];
    });
  }

  registerBuiltInInstances(instances) {
    this.registerInstances(instances);
    this.registerInstances(prefixKeys("$", instances));
  }

  registerFactory(factory, options = {}) {
    this[factoryFns].push(factory);
  }

  registerFactories(factories, options = {}) {
    this.registerFactory(parallelFactoryFns(factories), options);
  }

  registerPostProcessor(postProcessor) {
    this[postProcessorFns].push(postProcessor);
  }

  async refresh() {
    for (const factoryFn of this[factoryFns]) {
      const instances = await factoryFn(this);
      this.registerInstances(instances);

      for (const postProcessorFn of this[postProcessorFns]) {
        await postProcessorFn(instances);
      }
    }
  }
};
