const getBody = event =>
  Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8").toString();

module.exports = event => {
  const body = getBody(event);
  try {
    return JSON.parse(body);
  } catch (e) {
    return body;
  }
};
