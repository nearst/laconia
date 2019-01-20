module.exports = class ApiGatewayInputHeaders {
  constructor(eventHeaders) {
    Object.assign(this, eventHeaders);
    Object.entries(eventHeaders).forEach(([headerName, headerValue]) => {
      this[headerName.toLowerCase()] = headerValue;
    });
  }
};
