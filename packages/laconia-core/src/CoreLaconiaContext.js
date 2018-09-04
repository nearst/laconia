const LaconiaContext = require("./LaconiaContext");

const memoize = fn => {
  let result;
  return async () => {
    if (result === undefined) {
      result = await fn(arguments);
    }
    return result;
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

  registerFactory(factory) {
    super.registerFactory(memoize(factory));
  }
};
