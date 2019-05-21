const parseWebSocket = require("./parseWebSocket");

module.exports = class ApiGatewayWebSocketEvent {
  constructor(body) {
    this.body = body;
  }

  static fromRaw(event) {
    const apiGatewayWebSocketEvent = new ApiGatewayWebSocketEvent(
      parseWebSocket(event)
    );
    apiGatewayWebSocketEvent.context = event.requestContext;
    return apiGatewayWebSocketEvent;
  }
};
