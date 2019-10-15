const getResponseProps = require("./getResponseProps");

module.exports = class ApiGatewayResponse {
  static create(output, statusCode = 200, headers = {}) {
    const response = getResponseProps(output);
    return Object.assign(new ApiGatewayResponse(), {
      statusCode,
      body: response.getBody(),
      isBase64Encoded: response.isBase64Encoded,
      headers: Object.assign({ "Content-Type": response.contentType }, headers)
    });
  }
};
