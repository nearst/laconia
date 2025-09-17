const { InvokeCommand, LambdaClient } = require("@aws-sdk/client-lambda");

const HandledInvokeLaconiaError = require("./HandledInvokeLaconiaError");
const UnhandledInvokeLaconiaError = require("./UnhandledInvokeLaconiaError");

const validateStatusCode = (statusCode, expectedStatusCode) => {
  if (statusCode !== expectedStatusCode) {
    throw new Error(
      `Status code returned was: ${statusCode}, expected status code is: ${expectedStatusCode}`
    );
  }
};

module.exports = class LambdaInvoker {
  constructor(functionName, lambda, requestLogs) {
    this.lambda = lambda || new LambdaClient();
    this.functionName = functionName;
    this.requestLogs = requestLogs;
    this.fireAndForget = this.fireAndForget.bind(this);
    this.requestResponse = this.requestResponse.bind(this);
  }

  fireAndForget(payload) {
    return this._send(
      {
        InvocationType: "Event"
      },
      payload,
      202
    );
  }

  async requestResponse(payload) {
    const data = await this._send(
      {
        InvocationType: "RequestResponse",
        LogType: this.requestLogs ? "Tail" : "None"
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

  async _send(baseParams, payload, validStatusCode) {
    const params = Object.assign(
      {
        FunctionName: this.functionName
      },
      baseParams
    );

    if (payload === undefined) {
      params.Payload = undefined;
    } else {
      params.Payload = JSON.stringify(payload);
    }

    const command = new InvokeCommand(params);
    const data = await this.lambda.send(command);

    if (data && data.FunctionError) {
      const errorPayload = JSON.parse(data.Payload || "{}");
      if (data.FunctionError === "Handled") {
        throw new HandledInvokeLaconiaError(
          this.functionName,
          errorPayload,
          data.LogResult
        );
      } else {
        throw new UnhandledInvokeLaconiaError(this.functionName, errorPayload);
      }
    } else {
      validateStatusCode(data?.StatusCode, validStatusCode);
    }

    return data;
  }
};
