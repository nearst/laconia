const querystring = require("querystring");
const getBody = require("./getBody");

const parseJsonBody = body => {
  try {
    return JSON.parse(body);
  } catch (e) {
    throw Error(
      "The request body is not JSON even though the Content-Type is set to application/json"
    );
  }
};

module.exports = (event, headers) => {
  const contentType = headers["Content-Type"] || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return querystring.parse(getBody(event));
  } else if (contentType.includes("application/json")) {
    return parseJsonBody(getBody(event));
  } else {
    return event.body;
  }
};
