const LambdaApiInputConverter = require("./LambdaApiInputConverter");

exports.lambdaApi = () => () => ({
  $inputConverter: new LambdaApiInputConverter()
});
