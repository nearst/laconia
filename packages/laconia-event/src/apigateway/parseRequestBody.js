const querystring = require("querystring");

const getBody = event =>
  Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8").toString();

const parseJsonBody = body => {
  try {
    return JSON.parse(body);
  } catch (e) {
    throw Error(
      "The request body is not JSON even though the Content-Type is set to application/json"
    );
  }
};

const getPropertyCI = (obj, key) => {
  let lowerKey = key.toLowerCase();
  let myKey = Object.keys(obj).find(k => lowerKey === k.toLowerCase());
  return obj[myKey];
};

module.exports = event => {
  const contentType = getPropertyCI(event.headers, "Content-Type") || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return querystring.parse(getBody(event));
  } else if (contentType.includes("application/json")) {
    return parseJsonBody(getBody(event));
  } else {
    return event.body;
  }
};
