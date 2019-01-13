const ApiGatewayEventAdapter = require("./ApiGatewayEventAdapter");
const ApiGatewayBodyInputConverter = require("./ApiGatewayBodyInputConverter");
const ApiGatewayParamsInputConverter = require("./ApiGatewayParamsInputConverter");
const ApiGatewayResponseConverter = require("./ApiGatewayResponseConverter");

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
  responseAdditionalHeaders
} = {}) => app => {
  const adapter = new ApiGatewayEventAdapter(
    app,
    createInputConverter(inputType),
    new ApiGatewayResponseConverter({
      statusCode: responseStatusCode,
      additionalHeaders: responseAdditionalHeaders
    }),
    includeInputHeaders
  );
  return functional ? adapter.toFunction() : adapter;
};

module.exports = createApiAgatewayAdapter;
