const getContentType = require("./getContentType");

module.exports = class ApiGatewayResponse {
  static create(output, statusCode = 200, headers = {}) {
    const body = typeof output !== "string" ? JSON.stringify(output) : output;
    const contentType = getContentType(output);

    const response = new ApiGatewayResponse();
    response.body = body;
    response.statusCode = statusCode;
    response.headers = Object.assign({ "Content-Type": contentType }, headers);
    response.isBase64Encoded = false;
    return response;
  }
};
