const ApiGatewayParamsInputConverter = require("./ApiGatewayParamsInputConverter");
const ApiGatewayBodyInputConverter = require("./ApiGatewayBodyInputConverter");
const createLaconiaApiHandler = require("./createLaconiaApiHandler");

exports.params = options =>
  createLaconiaApiHandler(() => new ApiGatewayParamsInputConverter(), options);

exports.body = options =>
  createLaconiaApiHandler(() => new ApiGatewayBodyInputConverter(), options);
