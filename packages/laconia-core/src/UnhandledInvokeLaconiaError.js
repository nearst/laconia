const UnhandledInvokeLaconiaError = class UnhandledInvokeLaconiaError extends Error {
  constructor(functionName, lambdaErrorPayload) {
    super(`Error in ${functionName}: ${lambdaErrorPayload.errorMessage}`);
    this.name = "Unhandled";
    this.functionName = functionName;
  }
};

module.exports = UnhandledInvokeLaconiaError;
