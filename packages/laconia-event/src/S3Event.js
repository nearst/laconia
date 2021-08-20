const AWS = require("aws-sdk");

const toParams = Symbol("toParams");

module.exports = class S3Event {
  constructor(bucket, key, s3) {
    this.bucket = bucket;
    this.key = key;
    this.s3 = s3;
  }

  [toParams]() {
    return { Bucket: this.bucket, Key: this.key };
  }

  getStream() {
    const stream = this.s3.getObject(this[toParams]()).createReadStream();
    stream.setEncoding("utf8");
    return stream;
  }

  async getObject() {
    const object = await this.s3.getObject(this[toParams]()).promise();
    return object.Body;
  }

  async getJson() {
    const object = await this.getObject(this.s3);
    return JSON.parse(object.toString());
  }

  async getText() {
    const object = await this.getObject(this.s3);
    return object.toString();
  }

  static fromRaw(event, s3 = new AWS.S3()) {
    const record = event.Records[0];
    const { key } = record.s3.object;
    const { name } = record.s3.bucket;
    return new S3Event(name, decodeURIComponent(key.replace(/\+/g, " ")), s3);
  }
};
