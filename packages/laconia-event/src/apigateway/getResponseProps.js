const types = [
  [
    Buffer,
    body => ({
      isBase64Encoded: true,
      contentType: "application/octet-stream",
      getBody: () => body.toString("base64")
    })
  ],
  [
    Number,
    body => ({
      isBase64Encoded: false,
      contentType: "text/plain",
      getBody: () => JSON.stringify(body)
    })
  ],
  [
    String,
    body => ({
      isBase64Encoded: false,
      contentType: "text/plain",
      getBody: () => body
    })
  ],
  [
    Object,
    body => ({
      isBase64Encoded: false,
      contentType: "application/json; charset=utf-8",
      getBody: () => JSON.stringify(body)
    })
  ]
];

module.exports = body => {
  const [adapter] = types.find(([type]) => Object(body) instanceof type);
  return adapter(body);
};
