const laconia = require("@laconia/core");
const lambdaApi = require("lambda-api");

const convertApigatewayToLambdaApi = resourcePath =>
  resourcePath.replace(/{([^}]*)}/g, ":$1");

const getRoutePath = event => {
  if (!event.requestContext) {
    throw new Error(
      "requestContext is not available in the event object. Laconia API only supports Lambda Proxy Integration."
    );
  }
  return convertApigatewayToLambdaApi(event.requestContext.resourcePath);
};

module.exports = fn => {
  const lambdaApiApp = lambdaApi();

  return laconia((event, laconiaContext) => {
    lambdaApiApp.any(getRoutePath(event), async (req, res) => {
      return fn({ req, res }, laconiaContext);
    });

    const { context } = laconiaContext;
    return lambdaApiApp.run(event, context);
  });
};
