const { invoke } = require("laconia-core");
const LaconiaTester = require("./LaconiaTester");
const S3Spier = require("./S3Spier");

const defineUnavailableSpy = object => {
  Object.defineProperty(object, "spy", {
    get: () => {
      throw new Error(
        "spy is not enabled, check documentation to set the required options to enable this feature"
      );
    }
  });
  return object;
};

const getSpyOptions = options => {
  return options.spy || {};
};

const isSpyOptionsSet = options =>
  getSpyOptions(options).bucketName !== undefined;

const createSpier = (functionName, options) => {
  return new S3Spier(options.spy.bucketName, functionName, options.spy.options);
};

module.exports = (functionName, options = {}) => {
  const invoker = invoke(functionName, options);
  invoker.requestLogs = true;
  const laconiaTester = new LaconiaTester(invoker);
  if (isSpyOptionsSet(options)) {
    laconiaTester.spy = createSpier(functionName, options);
    return laconiaTester;
  } else {
    return defineUnavailableSpy(laconiaTester);
  }
};
