const S3Event = require("./S3Event");

module.exports = class S3JsonInputConverter {
  constructor(s3) {
    this.s3 = s3;
  }

  async convert(event) {
    const s3Event = S3Event.fromRaw(event);
    return s3Event.getJson(this.s3);
  }
};
