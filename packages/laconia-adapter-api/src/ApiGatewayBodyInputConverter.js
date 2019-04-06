const { req } = require("@laconia/event").apigateway;

module.exports = class ApiGatewayBodyInputConverter {
  convert(event) {
    const apiGatewayEvent = req(event);
    return {
      payload: apiGatewayEvent.body,
      headers: Object.assign(
        {},
        apiGatewayEvent.headers,
        apiGatewayEvent.params
      )
    };
  }
};
