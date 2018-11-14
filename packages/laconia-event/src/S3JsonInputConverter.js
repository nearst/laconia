const S3EventInputConverter = require("./S3EventInputConverter");

module.exports = class S3JsonInputConverter extends S3EventInputConverter {
  constructor(s3) {
    super(s3);
    this.s3 = s3;
  }

  getObject(bucket, key) {
    return this.s3
      .getObject({
        Bucket: bucket,
        Key: key
      })
      .promise();
  }

  async convert(event) {
    const { bucket, key } = super.convert(event);
    const object = await this.getObject(bucket, key);
    return JSON.parse(object.Body.toString());
  }
};
