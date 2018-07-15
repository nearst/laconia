const overrideStack = (err, overrideFn) => {
  Object.defineProperty(err, "stack", {
    get: () => overrideFn(),
    set: value => {}
  });
};

const getLambdaStack = lambdaStackTrace =>
  lambdaStackTrace.map(t => `    at ${t}`).join("\n");

const extendStack = (invokeLaconiaError, extension) => {
  const err = new Error();
  err.name = invokeLaconiaError.name;
  Error.captureStackTrace(err, InvokeLaconiaError);
  return () =>
    err.stack +
    `\nCaused by an error in ${invokeLaconiaError.functionName} Lambda:\n` +
    getLambdaStack(invokeLaconiaError.lambdaStackTrace);
};

const InvokeLaconiaError = class InvokeLaconiaError extends Error {
  constructor(functionName, lambdaErrorPayload) {
    super(lambdaErrorPayload.errorMessage);
    this.name = lambdaErrorPayload.errorType;
    this.functionName = functionName;
    this.lambdaStackTrace = lambdaErrorPayload.stackTrace;

    overrideStack(this, extendStack(this));
  }
};

module.exports = InvokeLaconiaError;
