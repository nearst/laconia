const AWS = require("aws-sdk");
const pWaitFor = require("p-wait-for");
const s3 = new AWS.S3();

const getBucket = bucketName => {
  const bucket = bucketName || process.env.TRACKER_BUCKET_NAME;
  if (bucket === undefined) {
    throw new Error(
      "bucketName must be set either from the constructor or by setting the TRACKER_BUCKET_NAME env variable"
    );
  }
  return bucket;
};

module.exports = (id, bucketName) => {
  const bucket = getBucket(bucketName);

  return {
    async tick(info) {
      return s3
        .putObject({
          Bucket: bucket,
          Key: `${id}/${Date.now()}`,
          Body: JSON.stringify(info)
        })
        .promise();
    },

    waitUntil(totalTicks) {
      return pWaitFor(async () => (await this.getTotal()) >= totalTicks);
    },

    async getTicks() {
      const objects = await s3
        .listObjects({
          Bucket: bucket,
          Prefix: id
        })
        .promise();
      return Promise.all(
        objects.Contents.map(t =>
          s3
            .getObject({
              Bucket: bucket,
              Key: t.Key
            })
            .promise()
        )
      ).then(results => {
        return results.map(result => JSON.parse(result.Body.toString()));
      });
    },

    async getTotal() {
      const objects = await s3
        .listObjects({
          Bucket: bucket,
          Prefix: id
        })
        .promise();
      return Number(objects.Contents.length);
    },

    async clear() {
      const objects = await s3
        .listObjects({
          Bucket: bucket,
          Prefix: id
        })
        .promise();
      return Promise.all(
        objects.Contents.map(t =>
          s3
            .deleteObject({
              Bucket: bucket,
              Key: t.Key
            })
            .promise()
        )
      );
    }
  };
};
