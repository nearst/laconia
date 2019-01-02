const querystring = require("querystring");

const formData = event =>
  event.headers["Content-Type"].includes("application/x-www-form-urlencoded");

const getBody = event =>
  Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8").toString();

module.exports = class ApiGatewayBodyInputConverter {
  convert(event) {
    const body = getBody(event);
    const payload = formData(event)
      ? querystring.parse(body)
      : JSON.parse(body);
    return {
      payload,
      headers: Object.assign(
        event.headers,
        event.pathParameters,
        event.queryStringParameters
      )
    };
  }
};
