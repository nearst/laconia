const parseRequestBody = require("./parseRequestBody");
const ApiGatewayInputHeaders = require("./ApiGatewayInputHeaders");

module.exports = class ApiGatewayParamsInputConverter {
  convert(event) {
    return {
      payload: Object.assign(
        { body: parseRequestBody(event) },
        event.pathParameters,
        event.queryStringParameters
      ),
      headers: new ApiGatewayInputHeaders(event.headers)
    };
  }
};
