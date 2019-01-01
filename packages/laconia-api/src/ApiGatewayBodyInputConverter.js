const querystring = require("querystring");
module.exports = class ApiGatewayMergedInputConverter {
  convert(event) {
    if (
      event.headers["Content-Type"].includes(
        "application/x-www-form-urlencoded"
      )
    ) {
      return { payload: querystring.parse(event.body) };
    } else {
      return {
        payload: JSON.parse(event.body),
        headers: Object.assign(
          event.pathParameters,
          event.queryStringParameters
        )
      };
    }
  }
};
