module.exports = class S3TotalOrderStorage {
  constructor(s3, bucket) {
    this.s3 = s3;
    this.bucket = bucket;
  }

  async putJson(totalOrder) {
    return this.s3
      .putObject({
        Bucket: this.bucket,
        Key: `json/${Date.now()}`,
        Body: JSON.stringify(totalOrder)
      })
      .promise();
  }

  async getJsons() {
    const objects = await this.s3
      .listObjects({
        Bucket: this.bucket,
        Prefix: "json"
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
      return results.map(result => JSON.parse(result.Body.toString()));
    });
  }
};
