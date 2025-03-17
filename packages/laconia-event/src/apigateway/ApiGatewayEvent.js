const parseRequestBody = require("./parseRequestBody");
const ApiGatewayInputHeaders = require("./ApiGatewayInputHeaders");

module.exports = class ApiGatewayEvent {
  static fromRaw(event) {
    const apiGatewayEvent = new ApiGatewayEvent();
    apiGatewayEvent.headers = new ApiGatewayInputHeaders(event.headers);
    apiGatewayEvent.body =
      event.body === null || event.body === undefined
        ? null
        : parseRequestBody(event, apiGatewayEvent.headers);
    apiGatewayEvent.params = Object.assign(
      {},
      event.pathParameters,
      event.queryStringParameters
    );
    return apiGatewayEvent;
  }
};
