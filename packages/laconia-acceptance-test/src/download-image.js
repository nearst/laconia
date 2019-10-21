const fs = require("fs");
const laconia = require("@laconia/core");
const adapterApi = require("@laconia/adapter-api");

const apigateway = adapterApi.apigateway({});
const imgPath = `${__dirname}/resources/2_vertical@0.5x.png`;

exports.app = async () => ({
  body: fs.readFileSync(imgPath),
  statusCode: 200
});

exports.handler = laconia(apigateway(exports.app));
