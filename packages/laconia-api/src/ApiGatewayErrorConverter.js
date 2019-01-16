const getMappingResponse = (mappings, error) => {
  let mappingResponse = {};
  for (let [errorRegex, response] of mappings.entries()) {
    if (error.name.match(errorRegex)) {
      mappingResponse = response(error);
    }
  }
  return mappingResponse;
};

module.exports = class ApiGatewayErrorConverter {
  constructor({ additionalHeaders = {}, mappings = new Map() } = {}) {
    this.additionalHeaders = additionalHeaders;
    this.mappings = mappings;
  }

  convert(error) {
    let mappingResponse = getMappingResponse(this.mappings, error);

    return {
      body: error.message,
      headers: Object.assign({}, this.additionalHeaders),
      statusCode: mappingResponse.statusCode || error.statusCode || 500,
      isBase64Encoded: false
    };
  }
};
