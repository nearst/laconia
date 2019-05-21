module.exports = event =>
  Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8").toString();
