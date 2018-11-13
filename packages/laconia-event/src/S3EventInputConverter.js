const S3Event = require("./S3Event");

module.exports = class S3EventInputConverter {
  constructor(s3) {
    this.s3 = s3;
  }

  convert(event) {
    const record = event.Records[0];
    const { key } = record.s3.object;
    const { name } = record.s3.bucket;
    return new S3Event(
      this.s3,
      name,
      decodeURIComponent(key.replace(/\+/g, " "))
    );
  }
};
