const getMappingEntries = mappings =>
  mappings instanceof Map ? mappings.entries() : Object.entries(mappings);

const getMappingResponse = (mappings, error) => {
  let mappingResponse = {};
  for (let [errorRegex, mapping] of getMappingEntries(mappings)) {
    if (error.name.match(errorRegex)) {
      mappingResponse = mapping(error);
      break;
    }
  }
  return mappingResponse;
};

module.exports = class ApiGatewayErrorConverter {
  constructor({ additionalHeaders = {}, mappings = {} } = {}) {
    this.additionalHeaders = additionalHeaders;
    this.mappings = mappings;
  }

  convert(error) {
    let mappingResponse = getMappingResponse(this.mappings, error);

    return {
      body: mappingResponse.body || error.message,
      headers: Object.assign(
        {},
        this.additionalHeaders,
        mappingResponse.headers
      ),
      statusCode: mappingResponse.statusCode || error.statusCode || 500,
      isBase64Encoded: false
    };
  }
};
