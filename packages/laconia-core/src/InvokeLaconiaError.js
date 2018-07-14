module.exports = class InvokeLaconiaError extends Error {
  constructor(lambdaErrorPayload) {
    super(lambdaErrorPayload.errorMessage);
    this.name = lambdaErrorPayload.errorType;
    this.lambdaStackTrace = lambdaErrorPayload.stackTrace;

    Object.defineProperty(this, "stack", {
      get: () => this.generateLambdaStack(),
      set: value => {}
    });

    const err = new Error();
    Error.captureStackTrace(err, InvokeLaconiaError);
    this._error = err;
  }

  generateLambdaStack() {
    // Calling _error.stack here to reduce performance impact of overriding stack
    return (
      this._error.stack +
      "\n" +
      "Caused by Lambda Invocation error:\n" +
      this.lambdaStackTrace.map(t => `    at ${t}`).join("\n")
    );
  }
};
