module.exports = class ApiGatewayInputHeaders {
  constructor(eventHeaders) {
    Object.assign(this, eventHeaders);
    Object.entries(eventHeaders).forEach(([headerName, headerValue]) => {
      this[headerName.toLowerCase()] = headerValue;
    });

    const handler = {
      get: (target, prop) => {
        const isSymbol = typeof prop === "symbol";
        const isExisting = prop in target;
        const propertyKey = isSymbol || isExisting ? prop : prop.toLowerCase();
        return target[propertyKey];
      }
    };

    return new Proxy(this, handler);
  }
};
