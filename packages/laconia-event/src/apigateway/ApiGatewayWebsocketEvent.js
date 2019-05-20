const parseWebsocket = require("./parseWebsocket");
const ApiGatewayWebsocketRequestContext = require("./ApiGatewayWebsocketRequestContext");

module.exports = class ApiGatewayWebsocketEvent {
  constructor(body) {
    this.body = body;
  }

  static fromRaw(event) {
    const apiGatewayWebsocketEvent = new ApiGatewayWebsocketEvent(
      parseWebsocket(event)
    );
    apiGatewayWebsocketEvent.requestContext = new ApiGatewayWebsocketRequestContext(
      event.requestContext
    );
    return apiGatewayWebsocketEvent;
  }
};
