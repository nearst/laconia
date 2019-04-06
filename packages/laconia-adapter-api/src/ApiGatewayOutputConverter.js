const { res } = require("@laconia/event").apigateway;

module.exports = class ApiGatewayOutputConverter {
  constructor({ statusCode = 200, additionalHeaders = {} } = {}) {
    this.statusCode = statusCode;
    this.additionalHeaders = additionalHeaders;
  }

  convert(output) {
    return res(output, this.statusCode, this.additionalHeaders);
  }
};
