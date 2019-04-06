const parseRequestBody = require("./parseRequestBody");
const ApiGatewayInputHeaders = require("./ApiGatewayInputHeaders");

module.exports = class ApiGatewayEvent {
  constructor(body) {
    this.body = body;
  }

  static fromRaw(event) {
    const apiGatewayEvent = new ApiGatewayEvent(parseRequestBody(event));
    apiGatewayEvent.headers = new ApiGatewayInputHeaders(event.headers);
    apiGatewayEvent.params = Object.assign(
      {},
      event.pathParameters,
      event.queryStringParameters
    );
    return apiGatewayEvent;
  }
};
