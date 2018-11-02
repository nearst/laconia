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

  async putXml(totalOrder) {
    return this.s3
      .putObject({
        Bucket: this.bucket,
        Key: `xml/${Date.now()}`,
        Body: totalOrder
      })
      .promise();
  }

  async clear() {
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

  async getObject(key) {
    const object = await this.s3
      .getObject({
        Bucket: this.bucket,
        Key: key
      })
      .promise();

    return JSON.parse(object.Body.toString());
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

  async getXmls() {
    const objects = await this.s3
      .listObjects({
        Bucket: this.bucket,
        Prefix: "xml"
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
      return results.map(result => result.Body.toString());
    });
  }
};
