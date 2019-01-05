const laconiaApi = require("./laconiaApi");
const ApiGatewayParamsInputConverter = require("./ApiGatewayParamsInputConverter");
const ApiGatewayBodyInputConverter = require("./ApiGatewayBodyInputConverter");
const createLaconiaApiHandler = require("./createLaconiaApiHandler");

module.exports = exports = laconiaApi;
exports.default = laconiaApi;

exports.params = () =>
  createLaconiaApiHandler(() => new ApiGatewayParamsInputConverter());

exports.body = () =>
  createLaconiaApiHandler(() => new ApiGatewayBodyInputConverter());
