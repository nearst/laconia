const { res } = require("@laconia/event").apigateway;

const getMappingEntries = mappings =>
  mappings instanceof Map ? mappings.entries() : Object.entries(mappings);

const getMappingResponse = (mappings, error) => {
  let mappingResponse = {};
  for (const [errorRegex, mapping] of getMappingEntries(mappings)) {
    if (error.name.match(errorRegex) || error.message.match(errorRegex)) {
      mappingResponse = mapping(error);
      break;
    }
  }
  return mappingResponse;
};

module.exports = class ApiGatewayNameMappingErrorConverter {
  constructor({ additionalHeaders = {}, mappings = {} } = {}) {
    this.additionalHeaders = additionalHeaders;
    this.mappings = mappings;
  }

  convert(error) {
    const mappingResponse = getMappingResponse(this.mappings, error);
    const body = mappingResponse.body || error.message;
    const statusCode = mappingResponse.statusCode || error.statusCode || 500;
    const headers = Object.assign(
      this.additionalHeaders,
      mappingResponse.headers
    );
    return res(body, statusCode, headers);
  }
};
