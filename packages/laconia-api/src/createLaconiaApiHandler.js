const laconia = require("@laconia/core");

module.exports = (inputConverterFactory, options = {}) => {
  return app => {
    return laconia(async (event, laconiaContext) => {
      const input = await inputConverterFactory(laconiaContext).convert(event);
      const result = options.headers
        ? await app(input.payload, input.headers, laconiaContext)
        : await app(input.payload, laconiaContext);
      return {
        body: JSON.stringify(result),
        headers: { "content-type": "application/json" },
        statusCode: 200
      };
    });
  };
};
