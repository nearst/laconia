const S3Event = require("./S3Event");

module.exports = class S3StreamInputConverter {
  constructor(s3) {
    this.s3 = s3;
  }

  convert(event) {
    const s3Event = S3Event.fromRaw(event);
    return s3Event.getStream(this.s3);
  }
};
