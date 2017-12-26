module.exports = class LambdaInvoker {
  constructor(lambda, functionName) {
    this.lambda = lambda;
    this.functionName = functionName;
  }

  fireAndForget(payload) {
    const params = {
      FunctionName: this.functionName,
      InvocationType: "Event"
    };
    if (payload !== undefined) {
      params.Payload = JSON.stringify(payload);
    }

    return this.lambda
      .invoke(params)
      .promise()
      .then(data => {
        if (data.FunctionError) {
          throw new Error(
            `${data.FunctionError} error returned by ${this.functionName}: ${
              data.Payload
            }`
          );
        } else {
          return data;
        }
      });
  }
};
