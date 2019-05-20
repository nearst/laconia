const parseWebsocket = require("./parseWebsocket");
const ApiGatewayWebsocketContext = require("./ApiGatewayWebsocketContext");

module.exports = class ApiGatewayWebsocketEvent {
  constructor(body) {
    this.body = body;
  }

  static fromRaw(event) {
    const apiGatewayWebsocketEvent = new ApiGatewayWebsocketEvent(
      parseWebsocket(event)
    );
    apiGatewayWebsocketEvent.context = new ApiGatewayWebsocketContext(
      event.requestContext
    );
    return apiGatewayWebsocketEvent;
  }
};
