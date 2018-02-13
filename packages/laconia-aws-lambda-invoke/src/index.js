const AWS = require("aws-sdk");

const validateStatusCode = (statusCode, expectedStatusCode) => {
  if (statusCode !== expectedStatusCode) {
    throw new Error(`Status code returned was: ${statusCode}`);
  }
};

module.exports.LambdaInvoker = class LambdaInvoker {
  constructor(functionName, { lambda = new AWS.Lambda() } = {}) {
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
      throw new Error(
        `${data.FunctionError} error returned by ${this.functionName}: ${
          data.Payload
        }`
      );
    }
    validateStatusCode(data.StatusCode, validStatusCode);
    return data;
  }
};
