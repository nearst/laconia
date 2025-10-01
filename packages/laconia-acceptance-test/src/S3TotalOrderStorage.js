const { S3 } = require("aws-sdk");
const pWaitFor = require("p-wait-for");

module.exports = class S3TotalOrderStorage {
  constructor(bucket) {
    this.s3 = new S3();
    this.bucket = bucket;
  }

  async put(type, totalOrder) {
    const body = type === "json" ? JSON.stringify(totalOrder) : totalOrder;
    return this.s3
      .putObject({
        Bucket: this.bucket,
        Key: `${type}/${Date.now()}`,
        Body: body
      })
      .promise();
  }

  async clearAll() {
    const objects = await this.s3
      .listObjects({
        Bucket: this.bucket
      })
      .promise();
    return Promise.all(
      objects.Contents.map(t =>
        this.s3
          .deleteObject({
            Bucket: this.bucket,
            Key: t.Key
          })
          .promise()
      )
    );
  }

  async getAll(type) {
    const objects = await this.s3
      .listObjects({
        Bucket: this.bucket,
        Prefix: type
      })
      .promise();
    return Promise.all(
      objects.Contents.map(t =>
        this.s3
          .getObject({
            Bucket: this.bucket,
            Key: t.Key
          })
          .promise()
      )
    ).then(results => {
      return results.map(result =>
        type === "json"
          ? JSON.parse(result.Body.toString())
          : result.Body.toString()
      );
    });
  }

  async getTotal(type) {
    const objects = await this.s3
      .listObjects({
        Bucket: this.bucket,
        Prefix: type
      })
      .promise();
    return Number(objects.Contents.length);
  }

  waitUntil(type, totalObjects) {
    return pWaitFor(async () => (await this.getTotal(type)) >= totalObjects);
  }
};
