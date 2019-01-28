const S3EventInputConverter = require("./S3EventInputConverter");

module.exports = class S3StreamInputConverter extends S3EventInputConverter {
  constructor(s3) {
    super(s3);
    this.s3 = s3;
  }

  convert(event) {
    const s3Event = super.convert(event);
    const stream = this.s3.getObject(s3Event.toParams()).createReadStream();
    stream.setEncoding("utf8");
    return stream;
  }
};
