const laconia = require("@laconia/core");

const validateApigatewayEvent = event => {
  if (!event.requestContext) {
    throw new Error(
      "requestContext is not available in the event object. Laconia API only supports Lambda Proxy Integration."
    );
  }
};

const parseBody = body => {
  try {
    return JSON.parse(body);
  } catch (e) {
    return body;
  }
};

module.exports = fn => {
  return laconia(async (event, laconiaContext) => {
    validateApigatewayEvent(event);
    const req = {
      query: event.queryStringParameters,
      pathParameters: event.pathParameters,
      params: event.pathParameters,
      headers: Object.keys(event.headers).reduce(
        (acc, header) =>
          Object.assign(acc, {
            [header.toLowerCase()]: event.headers[header]
          }),
        {}
      ),
      body: parseBody(event.body)
    };

    const result = await fn({ req }, laconiaContext);
    return {
      body: JSON.stringify(result),
      headers: { "content-type": "application/json" },
      statusCode: 200
    };
  });
};
