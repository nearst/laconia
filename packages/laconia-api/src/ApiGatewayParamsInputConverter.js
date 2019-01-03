const parseRequestBody = require("./parseRequestBody");

module.exports = class ApiGatewayParamsInputConverter {
  convert(event) {
    return {
      payload: Object.assign(
        { body: parseRequestBody(event) },
        event.pathParameters,
        event.queryStringParameters
      ),
      headers: event.headers
    };
  }
};
