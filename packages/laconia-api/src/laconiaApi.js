const laconia = require("@laconia/core");
const lambdaApi = require("lambda-api");

module.exports = fn => {
  const lambdaApiApp = lambdaApi();

  const handler = laconia((event, laconiaContext) => {
    const { context } = laconiaContext;

    lambdaApiApp.any(
      event.resourcePath.replace(/{([^}]*)}/g, ":$1"),
      async (req, res) => {
        return fn({ req, res }, laconiaContext);
      }
    );

    return lambdaApiApp.run(event, context);
  });

  return handler;
};
