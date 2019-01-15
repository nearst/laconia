module.exports = class ApiGatewayErrorConverter {
  constructor({ additionalHeaders = {} } = {}) {
    this.additionalHeaders = additionalHeaders;
  }

  convert(error) {
    return {
      body: error.message,
      headers: Object.assign({}, this.additionalHeaders),
      statusCode: error.statusCode || 500,
      isBase64Encoded: false
    };
  }
};
