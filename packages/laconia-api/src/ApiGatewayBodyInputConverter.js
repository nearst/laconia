const parseRequestBody = require("./parseRequestBody");
const ApiGatewayInputHeaders = require("./ApiGatewayInputHeaders");

module.exports = class ApiGatewayBodyInputConverter {
  convert(event) {
    const payload = parseRequestBody(event);
    return {
      payload,
      headers: new ApiGatewayInputHeaders(
        Object.assign(
          {},
          event.headers,
          event.pathParameters,
          event.queryStringParameters
        )
      )
    };
  }
};
