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
      contentType: "text/plain",
      getBody: () => JSON.stringify(body)
    })
  ],
  [
    String,
    body => ({
      contentType: "text/plain",
      getBody: () => body
    })
  ],
  [
    Object,
    body => ({
      contentType: "application/json; charset=utf-8",
      getBody: () => JSON.stringify(body)
    })
  ]
];

module.exports = body => {
  const bodyAsObject = Object(body);
  const [, adapter] = types.find(([type]) => bodyAsObject instanceof type);
  return adapter(body);
};
