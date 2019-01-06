const laconiaApi = require("./laconiaApi");
const ApiGatewayParamsInputConverter = require("./ApiGatewayParamsInputConverter");
const ApiGatewayBodyInputConverter = require("./ApiGatewayBodyInputConverter");
const createLaconiaApiHandler = require("./createLaconiaApiHandler");

module.exports = exports = laconiaApi;
exports.default = laconiaApi;

exports.params = options =>
  createLaconiaApiHandler(() => new ApiGatewayParamsInputConverter(), options);

exports.body = options =>
  createLaconiaApiHandler(() => new ApiGatewayBodyInputConverter(), options);
