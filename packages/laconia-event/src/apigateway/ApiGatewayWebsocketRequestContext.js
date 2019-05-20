module.exports = class ApiGatewayWebsocketRequestContext {
  constructor(requestContext) {
    Object.assign(this, requestContext);
  }
};
