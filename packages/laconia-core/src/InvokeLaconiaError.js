module.exports = class InvokeLaconiaError extends Error {
  constructor(lambdaErrorPayload) {
    super(lambdaErrorPayload.errorMessage);
    this.name = lambdaErrorPayload.errorType;
  }
};
