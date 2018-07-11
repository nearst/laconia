const AWS = require("aws-sdk");
const InvokeLaconiaError = require("./InvokeLaconiaError");

const validateStatusCode = (statusCode, expectedStatusCode) => {
  if (statusCode !== expectedStatusCode) {
    throw new Error(`Status code returned was: ${statusCode}`);
  }
};

class LambdaInvoker {
  constructor(functionName, lambda) {
    this.lambda = lambda;
    this.functionName = functionName;
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
        InvocationType: "RequestResponse"
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
      if (data.FunctionError === "Handled") {
        const errorPayload = JSON.parse(data.Payload);
        const error = new InvokeLaconiaError(errorPayload.errorMessage);
        error.name = errorPayload.errorType;

        throw error;
      } else {
        throw new Error(
          `${data.FunctionError} error returned by ${this.functionName}: ${
            data.Payload
          }`
        );
      }
    }
    validateStatusCode(data.StatusCode, validStatusCode);
    return data;
  }
}

module.exports = (functionName, { lambda = new AWS.Lambda() } = {}) => {
  return new LambdaInvoker(functionName, lambda);
};
