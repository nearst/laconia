const querystring = require("querystring");
module.exports = class ApiGatewayMergedInputConverter {
  convert(event) {
    if (
      event.headers["Content-Type"].includes(
        "application/x-www-form-urlencoded"
      )
    ) {
      return querystring.parse(event.body);
    } else {
      return Object.assign(
        JSON.parse(event.body),
        event.pathParameters,
        event.queryStringParameters
      );
    }
  }
};
