module.exports = class ApiGatewayMergedInputConverter {
  convert(event) {
    return JSON.parse(event.body);
  }
};
