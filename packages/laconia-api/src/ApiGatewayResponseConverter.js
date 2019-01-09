module.exports = class ApiGatewayResponseConverter {
  convert(output) {
    if (typeof output === "string") {
      return {
        body: output,
        headers: { "Content-Type": "text/plain" }
      };
    }
    return {
      body: JSON.stringify(output),
      headers: { "Content-Type": "application/json; charset=utf-8" }
    };
  }
};
