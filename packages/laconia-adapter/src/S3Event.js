module.exports = class S3Event {
  constructor(bucket, key) {
    this.bucket = bucket;
    this.key = key;
  }

  toParams() {
    return { Bucket: this.bucket, Key: this.key };
  }

  getStream(s3) {
    const stream = s3.getObject(this.toParams()).createReadStream();
    stream.setEncoding("utf8");
    return stream;
  }

  async getJson(s3) {
    const object = await s3.getObject(this.toParams()).promise();
    return JSON.parse(object.Body.toString());
  }

  static fromEvent(event) {
    const record = event.Records[0];
    const { key } = record.s3.object;
    const { name } = record.s3.bucket;
    return new S3Event(name, decodeURIComponent(key.replace(/\+/g, " ")));
  }
};
