const laconiaApi = require("./laconiaApi");
const ApiGatewayParamsInputConverter = require("./ApiGatewayParamsInputConverter");
const createLaconiaApiHandler = require("./createLaconiaApiHandler");

module.exports = exports = laconiaApi;
exports.default = laconiaApi;

exports.params = () =>
  createLaconiaApiHandler(() => new ApiGatewayParamsInputConverter());
