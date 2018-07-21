const overrideStack = (err, overrideFn) => {
  Object.defineProperty(err, "stack", {
    get: () => overrideFn()
  });
};

const getLambdaStack = lambdaStackTrace =>
  lambdaStackTrace.map(t => `    at ${t}`).join("\n");

const extendStack = (invokeLaconiaError, extension) => {
  const err = new Error(invokeLaconiaError.message);
  err.name = invokeLaconiaError.name;
  Error.captureStackTrace(err, HandledInvokeLaconiaError);
  return () =>
    err.stack +
    `\nCaused by an error in ${invokeLaconiaError.functionName} Lambda:\n` +
    getLambdaStack(invokeLaconiaError.lambdaStackTrace);
};

const HandledInvokeLaconiaError = class HandledInvokeLaconiaError extends Error {
  constructor(functionName, lambdaErrorPayload, logResult) {
    super(`Error in ${functionName}: ${lambdaErrorPayload.errorMessage}`);
    this.name = lambdaErrorPayload.errorType;
    this.functionName = functionName;
    this.lambdaStackTrace = lambdaErrorPayload.stackTrace;
    this.logs = logResult
      ? Buffer.from(logResult, "base64").toString()
      : undefined;

    overrideStack(this, extendStack(this));
  }
};

module.exports = HandledInvokeLaconiaError;
