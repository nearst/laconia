const LaconiaContext = require("./LaconiaContext");

const simpleCache = maxAge => {
  let value;
  let lastModified;

  return {
    hasExpired: () => {
      return Date.now() - lastModified > maxAge;
    },
    set: v => {
      lastModified = Date.now();
      value = v;
    },
    get: () => value,
    isEmpty: () => value === undefined
  };
};

const cacheResult = (fn, maxAge) => {
  const cache = simpleCache(maxAge);

  return async () => {
    if (cache.isEmpty() || cache.hasExpired()) {
      cache.set(await fn(arguments));
    }
    return cache.get();
  };
};

module.exports = class CoreLaconiaContext extends LaconiaContext {
  constructor(baseContext) {
    super(baseContext);
    const coreInstances = {
      env: process.env
    };
    this.registerInstances(coreInstances);
    this._registerInstancesWithPrefix(coreInstances);
  }

  registerFactory(factory, { cache = true, maxAge = Infinity } = {}) {
    super.registerFactory(cache ? cacheResult(factory, maxAge) : factory);
  }
};
