module.exports = class InvokeLaconiaError extends Error {
  constructor(lambdaErrorPayload) {
    super(lambdaErrorPayload.errorMessage);
    this.name = lambdaErrorPayload.errorType;
    this.lambdaStackTrace = lambdaErrorPayload.stackTrace;

    Object.defineProperty(this, "stack", {
      get: () => {
        const extendedStack =
          this.invokeError.stack +
          "\n" +
          "Caused by Lambda Invocation error:\n" +
          this.lambdaStackTrace.map(t => `    at ${t}`).join("\n");
        return extendedStack;
      },
      set: value => {}
    });

    const err = new Error();
    Error.captureStackTrace(err, InvokeLaconiaError);
    this.invokeError = err;
  }
};
