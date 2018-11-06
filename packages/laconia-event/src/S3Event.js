module.exports = class S3Event {
  constructor(s3, bucket, key) {
    this.s3 = s3;
    this.bucket = bucket;
    this.key = key;
  }

  getObject() {
    return this.s3
      .getObject({
        Bucket: this.bucket,
        Key: this.key
      })
      .promise();
  }

  async getJson() {
    const object = await this.getObject();
    return JSON.parse(object.Body.toString());
  }
};
