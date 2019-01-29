const getContentType = require("./getContentType");

module.exports = class ApiGatewayOutputConverter {
  constructor({ statusCode = 200, additionalHeaders = {} } = {}) {
    this.statusCode = statusCode;
    this.additionalHeaders = additionalHeaders;
  }

  convert(output) {
    const body = typeof output !== "string" ? JSON.stringify(output) : output;
    const contentType = getContentType(output);

    return {
      body,
      headers: Object.assign(
        { "Content-Type": contentType },
        this.additionalHeaders
      ),
      isBase64Encoded: false,
      statusCode: this.statusCode
    };
  }
};
