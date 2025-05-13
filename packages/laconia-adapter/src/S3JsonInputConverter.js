const { S3Client } = require("@aws-sdk/client-s3");
const { s3 } = require("@laconia/event");

module.exports = class S3JsonInputConverter {
  constructor(s3) {
    this.s3 = s3 || new S3Client();
  }

  async convert(event) {
    const s3Event = s3(event, this.s3);
    return s3Event.getJson();
  }
};
