const pWaitFor = require("p-wait-for");
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  S3Client
} = require("@aws-sdk/client-s3");

module.exports = class S3Spier {
  constructor(bucketName, functionName) {
    this.bucketName = bucketName;
    this.functionName = functionName;
    this.s3 = new S3Client();
  }

  get _prefix() {
    return `${this.functionName}`;
  }

  async _objectsKeys() {
    const objects = await this.s3.send(
      new ListObjectsCommand({ Bucket: this.bucketName, Prefix: this._prefix })
    );

    return objects.Contents?.map(content => content.Key) || [];
  }

  async _getTotalInvocations() {
    const keys = await this._objectsKeys();
    return Number(keys.length);
  }

  _getObjects(keys) {
    return Promise.all(
      keys.map(k => this.s3.send(new GetObjectCommand(this._objectParams(k))))
    );
  }

  _deleteObjects(keys) {
    return Promise.all(
      keys.map(k =>
        this.s3.send(new DeleteObjectCommand(this._objectParams(k)))
      )
    );
  }

  _objectParams(key) {
    return { Bucket: this.bucketName, Key: key };
  }

  track({ event, context }) {
    return this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `${this._prefix}/${Date.now()}-${context.awsRequestId}.json`,
        Body: JSON.stringify({ event }),
        ContentType: "application/json"
      })
    );
  }

  waitForTotalInvocations(totalInvocations) {
    return pWaitFor(
      async () => (await this._getTotalInvocations()) >= totalInvocations,
      { interval: 500 }
    );
  }

  async getInvocations() {
    const keys = await this._objectsKeys();
    const objects = await this._getObjects(keys);
    return Promise.all(
      objects.map(async o => JSON.parse(await o.Body.transformToString()))
    );
  }

  async clear() {
    const keys = await this._objectsKeys();
    return this._deleteObjects(keys);
  }
};
