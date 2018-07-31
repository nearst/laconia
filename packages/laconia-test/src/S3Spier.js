const AWS = require("aws-sdk");
const pWaitFor = require("p-wait-for");

module.exports = class S3Spier {
  constructor(bucketName, functionName, { s3 = new AWS.S3() } = {}) {
    this.bucketName = bucketName;
    this.functionName = functionName;
    this.s3 = s3;
  }

  get _prefix() {
    return `${this.functionName}/`;
  }

  async _objectsKeys() {
    const objects = await this.s3
      .listObjects({ Bucket: this.bucketName, Prefix: this._prefix })
      .promise();

    return objects.Contents.map(content => content.Key);
  }

  async _getTotalInvocations() {
    const keys = await this._objectsKeys();
    return Number(keys.length);
  }

  _getObjects(keys) {
    return Promise.all(
      keys.map(k => this.s3.getObject(this._objectParams(k)).promise())
    );
  }

  _deleteObjects(keys) {
    return Promise.all(
      keys.map(k => this.s3.deleteObject(this._objectParams(k)).promise())
    );
  }

  _objectParams(key) {
    return { Bucket: this.bucketName, Key: key };
  }

  track({ event, context }) {
    return this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: `${this._prefix}/${Date.now()}-${context.awsRequestId}`,
        Body: JSON.stringify({ event })
      })
      .promise();
  }

  waitForTotalInvocations(totalInvocations) {
    return pWaitFor(
      async () => (await this._getTotalInvocations()) >= totalInvocations
    );
  }

  async getInvocations() {
    const keys = await this._objectsKeys();
    const objects = await this._getObjects(keys);
    return objects.map(o => JSON.parse(o.Body.toString()));
  }

  async clear() {
    const keys = await this._objectsKeys();
    return this._deleteObjects(keys);
  }
};
