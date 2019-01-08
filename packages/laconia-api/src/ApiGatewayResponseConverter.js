module.exports = class ApiGatewayResponseConverter {
  convert(output) {
    return {
      body: JSON.stringify(output),
      headers: { "Content-Type": "application/json; charset=utf-8" }
    };
  }
};
