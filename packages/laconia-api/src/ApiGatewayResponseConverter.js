module.exports = class ApiGatewayResponseConverter {
  constructor({ statusCode = 200, additionalHeaders = {} } = {}) {
    this.statusCode = statusCode;
    this.additionalHeaders = additionalHeaders;
  }

  convert(output) {
    const body = typeof output !== "string" ? JSON.stringify(output) : output;
    const contentType =
      typeof output === "object"
        ? "application/json; charset=utf-8"
        : "text/plain";

    return {
      body,
      headers: Object.assign(
        { "Content-Type": contentType },
        this.additionalHeaders
      ),
      isBase64Encoded: false,
      statusCode: this.statusCode
    };
  }
};
