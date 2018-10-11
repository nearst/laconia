const AWS = require("aws-sdk");
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

const awsInstances = {
  $lambda: new AWS.Lambda(),
  $s3: new AWS.S3(),
  $ssm: new AWS.SSM()
};

module.exports = class CoreLaconiaContext extends LaconiaContext {
  constructor(baseContext) {
    super(baseContext);
    const coreInstances = {
      env: process.env
    };
    this.registerInstances(coreInstances);
    this._registerInstancesWithPrefix(coreInstances);
    this.registerFactory(() => awsInstances);
  }

  registerFactory(factory, { enabled = true, maxAge = 300000 } = {}) {
    super.registerFactory(enabled ? cacheResult(factory, maxAge) : factory);
  }
};
