module.exports = class ApiGatewayInputHeaders {
  constructor(eventHeaders) {
    Object.assign(this, eventHeaders);
    Object.entries(eventHeaders).forEach(([headerName, headerValue]) => {
      this[headerName.toLowerCase()] = headerValue;
    });

    const handler = {
      get: function(target, prop) {
        return target[prop.toLowerCase()];
      }
    };

    return new Proxy(this, handler);
  }
};
