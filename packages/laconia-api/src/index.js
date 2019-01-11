const ApiGatewayParamsInputConverter = require("./ApiGatewayParamsInputConverter");
const ApiGatewayBodyInputConverter = require("./ApiGatewayBodyInputConverter");
const ApiGatewayResponseConverter = require("./ApiGatewayResponseConverter");
const createLaconiaApiHandler = require("./createLaconiaApiHandler");

exports.params = options =>
  createLaconiaApiHandler(
    () => new ApiGatewayParamsInputConverter(),
    () => new ApiGatewayResponseConverter(),
    options
  );

exports.body = options =>
  createLaconiaApiHandler(
    () => new ApiGatewayBodyInputConverter(),
    () => new ApiGatewayResponseConverter(),
    options
  );
