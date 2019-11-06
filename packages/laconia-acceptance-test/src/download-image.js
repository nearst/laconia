const fs = require("fs");
const laconia = require("@laconia/core");
const adapterApi = require("@laconia/adapter-api");

const apigateway = adapterApi.apigateway({
  responseAdditionalHeaders: {
    "Content-Type": "image/png"
  }
});
const imgPath = `${__dirname}/resources/2_vertical@0.5x.png`;

exports.app = () => fs.readFileSync(imgPath);

exports.handler = laconia(apigateway(exports.app));
