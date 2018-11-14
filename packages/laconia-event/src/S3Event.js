module.exports = class S3Event {
  constructor(bucket, key) {
    this.bucket = bucket;
    this.key = key;
  }
};
