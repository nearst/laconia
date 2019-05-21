const createApiGatewayAdapter = require("./createApiGatewayAdapter");
const createWebSocketAdapter = require("./createWebSocketAdapter");

exports.apigateway = createApiGatewayAdapter;
exports.webSocket = createWebSocketAdapter;
