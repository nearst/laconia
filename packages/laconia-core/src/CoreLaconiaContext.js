const LaconiaContext = require("./LaconiaContext");
const SingleCache = require("./SingleCache");

const cacheResult = (fn, maxAge) => {
  const cache = new SingleCache(maxAge);

  return async (...args) => {
    if (cache.isEmpty() || cache.hasExpired()) {
      cache.set(await fn(...args));
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
    this.registerBuiltInInstances(coreInstances);
  }

  registerFactory(factory, { enabled = true, maxAge = 300000 } = {}) {
    super.registerFactory(enabled ? cacheResult(factory, maxAge) : factory);
  }
};
