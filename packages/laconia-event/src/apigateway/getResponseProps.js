const { Stream } = require("stream");

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
    Stream,
    body => ({
      isBase64Encoded: true,
      contentType: "application/octet-stream",
      getBody: () =>
        new Promise((resolve, reject) => {
          const buffers = [];
          body.on("error", reject);
          body.on("data", data => buffers.push(Buffer.from(data)));
          body.on("end", () =>
            resolve(
              Buffer.concat(buffers).toString(body.readableEncoding || "base64")
            )
          );
        })
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
  const typeAndResolver = types.find(([type]) => Object(body) instanceof type);
  const mapper = typeAndResolver[1];
  return mapper(body);
};
