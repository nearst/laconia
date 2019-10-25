const getResponseProps = require("./getResponseProps");

module.exports = class ApiGatewayResponse {
  static create(output, statusCode = 200, headers = {}) {
    const { getBody, isBase64Encoded, contentType } = getResponseProps(output);
    return Object.assign(new ApiGatewayResponse(), {
      statusCode,
      body: getBody(),
      isBase64Encoded: Boolean(isBase64Encoded),
      headers: Object.assign({ "Content-Type": contentType }, headers)
    });
  }
};
