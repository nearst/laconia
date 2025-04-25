const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

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

  async getStream() {
    const command = new GetObjectCommand(this[toParams]());
    const { Body } = await this.s3.send(command);

    return Body;
  }

  async getBuffer() {
    const stream = await this.getStream();
    const array = await stream.transformToByteArray();
    return Buffer.from(array);
  }

  async getJson() {
    const stream = await this.getStream();
    return JSON.parse(await stream.transformToString());
  }

  async getText() {
    const stream = await this.getStream();
    return stream.transformToString();
  }

  static fromRaw(event, s3 = new S3Client({})) {
    const record = event.Records[0];
    const { key } = record.s3.object;
    const { name } = record.s3.bucket;
    return new S3Event(name, decodeURIComponent(key.replace(/\+/g, " ")), s3);
  }
};
