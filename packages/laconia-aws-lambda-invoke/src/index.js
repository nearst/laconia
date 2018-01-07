const validateStatusCode = (statusCode, expectedStatusCode) => {
  if (statusCode !== expectedStatusCode) {
    throw new Error(`Status code returned was: ${statusCode}`);
  }
};

module.exports.LambdaInvoker = class LambdaInvoker {
  constructor(lambda, functionName) {
    this.lambda = lambda;
    this.functionName = functionName;
  }

  fireAndForget(payload) {
    return this._invoke(
      {
        InvocationType: "Event"
      },
      payload,
      202
    );
  }

  requestResponse(payload) {
    return this._invoke(
      {
        InvocationType: "RequestResponse"
      },
      payload,
      200
    ).then(data => {
      try {
        return JSON.parse(data.Payload);
      } catch (e) {
        return data.Payload;
      }
    });
  }

  _invoke(baseParams, payload, validStatusCode) {
    const params = Object.assign(
      {
        FunctionName: this.functionName
      },
      baseParams
    );

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
        }
        validateStatusCode(data.StatusCode, validStatusCode);
        return data;
      });
  }
};
