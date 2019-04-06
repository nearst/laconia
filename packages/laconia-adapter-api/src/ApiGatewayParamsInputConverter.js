const { req } = require("@laconia/event").apigateway;

module.exports = class ApiGatewayParamsInputConverter {
  convert(event) {
    const apiGatewayEvent = req(event);
    return {
      payload: Object.assign(
        { body: apiGatewayEvent.body },
        apiGatewayEvent.params
      ),
      headers: apiGatewayEvent.headers
    };
  }
};
