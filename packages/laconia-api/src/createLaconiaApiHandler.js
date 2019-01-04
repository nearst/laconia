const laconia = require("@laconia/core");

module.exports = inputConverterFactory => {
  return app => {
    return laconia(async (event, laconiaContext) => {
      const input = await inputConverterFactory(laconiaContext).convert(event);
      const result = await app(input.payload, laconiaContext);
      return {
        body: JSON.stringify(result),
        headers: { "content-type": "application/json" },
        statusCode: 200
      };
    });
  };
};
