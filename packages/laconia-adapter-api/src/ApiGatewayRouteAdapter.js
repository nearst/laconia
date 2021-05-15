const { res } = require("@laconia/event").apigateway;

module.exports = class ApiGatewayRouteAdapter {
  constructor(routeMappings) {
    this.routeMappings = routeMappings;
  }

  matchRoute(path, route) {
    const routeWithForwardSlash = route.startsWith("/") ? route : `/${route}`;

    if (routeWithForwardSlash.endsWith("*")) {
      return path.startsWith(route.replace("*", ""));
    }
    return routeWithForwardSlash === path;
  }

  findApp(path) {
    return Object.entries(this.routeMappings)
      .filter(routeMapping => this.matchRoute(path, routeMapping[0]))
      .map(routeMapping => routeMapping[1])[0];
  }

  async handle(event, laconiaContext) {
    const app = this.findApp(event.path);

    return app ? app(event, laconiaContext) : res({}, 404);
  }

  toFunction() {
    return this.handle.bind(this);
  }
};
