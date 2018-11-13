const S3EventInputConverter = require("./S3EventInputConverter");

module.exports = class S3StreamInputConverter extends S3EventInputConverter {
  constructor(s3) {
    super(s3);
    this.s3 = s3;
  }

  convert(event) {
    const { key, bucket } = super.convert(event);
    var stream = this.s3
      .getObject({
        Bucket: bucket,
        Key: key
      })
      .createReadStream();
    stream.setEncoding("utf8");
    return stream;
  }
};
