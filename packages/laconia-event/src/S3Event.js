module.exports = class S3Event {
  constructor(bucket, key) {
    this.bucket = bucket;
    this.key = key;
  }

  toParams() {
    return { Bucket: this.bucket, Key: this.key };
  }
};
