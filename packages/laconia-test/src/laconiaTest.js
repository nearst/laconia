const { LambdaClient } = require("@aws-sdk/client-lambda");
const laconiaInvoker = require("@laconia/invoker");
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
  const spier = new S3Spier(options.spy.bucketName, functionName);
  if (options.spy.s3) {
    spier.s3 = options.spy.s3;
  }
  return spier;
};

module.exports = (functionName, options = {}) => {
  const invoker = laconiaInvoker(
    functionName,
    options.lambda || new LambdaClient(),
    options
  );
  invoker.requestLogs = true;
  const laconiaTester = new LaconiaTester(invoker);
  if (isSpyOptionsSet(options)) {
    laconiaTester.spy = createSpier(functionName, options);
    return laconiaTester;
  } else {
    return defineUnavailableSpy(laconiaTester);
  }
};
