const ApiGatewayRouteAdapter = require("./ApiGatewayRouteAdapter");

// right now just accept string paths, not methods (get, post)
const createRouteAdapter = ({ mappings, functional = true } = {}) => {
  const adapter = new ApiGatewayRouteAdapter(mappings);
  return functional ? adapter.toFunction() : adapter;
};

module.exports = createRouteAdapter;
