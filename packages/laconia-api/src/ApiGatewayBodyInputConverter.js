const parseRequestBody = require("./parseRequestBody");

module.exports = class ApiGatewayBodyInputConverter {
  convert(event) {
    const payload = parseRequestBody(event);
    return {
      payload,
      headers: Object.assign(
        {},
        event.headers,
        event.pathParameters,
        event.queryStringParameters
      )
    };
  }
};
