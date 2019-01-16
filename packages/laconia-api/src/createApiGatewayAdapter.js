const ApiGatewayEventAdapter = require("./ApiGatewayEventAdapter");
const ApiGatewayBodyInputConverter = require("./ApiGatewayBodyInputConverter");
const ApiGatewayParamsInputConverter = require("./ApiGatewayParamsInputConverter");
const ApiGatewayOutputConverter = require("./ApiGatewayOutputConverter");
const ApiGatewayErrorConverter = require("./ApiGatewayErrorConverter");

const createInputConverter = inputType => {
  if (!["body", "params"].includes(inputType)) {
    throw new Error("Unsupported inputType: " + inputType);
  }
  return inputType === "body"
    ? new ApiGatewayBodyInputConverter()
    : new ApiGatewayParamsInputConverter();
};

const createApiAgatewayAdapter = ({
  inputType = "body",
  functional = true,
  includeInputHeaders = false,
  responseStatusCode,
  responseAdditionalHeaders,
  errorMappings
} = {}) => app => {
  const adapter = new ApiGatewayEventAdapter(
    app,
    createInputConverter(inputType),
    new ApiGatewayOutputConverter({
      statusCode: responseStatusCode,
      additionalHeaders: responseAdditionalHeaders
    }),
    new ApiGatewayErrorConverter({
      additionalHeaders: responseAdditionalHeaders,
      mappings: errorMappings
    }),
    includeInputHeaders
  );
  return functional ? adapter.toFunction() : adapter;
};

module.exports = createApiAgatewayAdapter;
