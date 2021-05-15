const createApiGatewayAdapter = require("./createApiGatewayAdapter");
const createWebSocketAdapter = require("./createWebSocketAdapter");
const routeAdapter = require("./createRouteAdapter");

exports.apigateway = createApiGatewayAdapter;
exports.webSocket = createWebSocketAdapter;
exports.routing = routeAdapter;
