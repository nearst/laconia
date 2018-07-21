const AWS = require("aws-sdk");
const HandledInvokeLaconiaError = require("./HandledInvokeLaconiaError");
const UnhandledInvokeLaconiaError = require("./UnhandledInvokeLaconiaError");

const validateStatusCode = (statusCode, expectedStatusCode) => {
  if (statusCode !== expectedStatusCode) {
    throw new Error(`Status code returned was: ${statusCode}`);
  }
};

class LambdaInvoker {
  constructor(functionName, lambda, requestsLog) {
    this.lambda = lambda;
    this.functionName = functionName;
    this.requestsLog = requestsLog;
    this.fireAndForget = this.fireAndForget.bind(this);
    this.requestResponse = this.requestResponse.bind(this);
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

  async requestResponse(payload) {
    const data = await this._invoke(
      {
        InvocationType: "RequestResponse",
        LogType: this.requestsLog ? "Tail" : "None"
      },
      payload,
      200
    );

    try {
      return JSON.parse(data.Payload);
    } catch (e) {
      return data.Payload;
    }
  }

  async _invoke(baseParams, payload, validStatusCode) {
    const params = Object.assign(
      {
        FunctionName: this.functionName
      },
      baseParams
    );

    if (payload !== undefined) {
      params.Payload = JSON.stringify(payload);
    }

    const data = await this.lambda.invoke(params).promise();
    if (data.FunctionError) {
      const errorPayload = JSON.parse(data.Payload);
      if (data.FunctionError === "Handled") {
        throw new HandledInvokeLaconiaError(
          this.functionName,
          errorPayload,
          data.LogResult
        );
      } else {
        throw new UnhandledInvokeLaconiaError(this.functionName, errorPayload);
      }
    }
    validateStatusCode(data.StatusCode, validStatusCode);
    return data;
  }
}

module.exports = (
  functionName,
  { lambda = new AWS.Lambda(), requestsLog = false } = {}
) => {
  return new LambdaInvoker(functionName, lambda, requestsLog);
};
