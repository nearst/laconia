module.exports = class ApiGatewayResponseConverter {
  convert(output) {
    const body = typeof output !== "string" ? JSON.stringify(output) : output;
    const contentType =
      typeof output === "object"
        ? "application/json; charset=utf-8"
        : "text/plain";

    return {
      body,
      headers: { "Content-Type": contentType },
      isBase64Encoded: false,
      statusCode: 200
    };
  }
};
