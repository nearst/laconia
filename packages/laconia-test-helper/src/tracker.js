const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const getBucket = bucketName => {
  const bucket = bucketName || process.env['TRACKER_BUCKET_NAME']
  if (bucket === undefined) {
    throw new Error('bucketName must be set either from the constructor or by setting the TRACKER_BUCKET_NAME env variable')
  }
  return bucket
}

module.exports = (id, bucketName) => {
  const bucket = getBucket(bucketName)

  return {
    async tick () {
      const total = await this.getTotal()
      return s3.putObject({
        Bucket: bucket,
        Key: `${id}/${total + 1}`
      }).promise()
    },

    waitUntil (totalTicks) {
      return s3.waitFor('objectExists', {
        Bucket: bucket,
        Key: `${id}/${totalTicks}`,
        $waiter: { delay: 1 }
      }).promise()
    },

    async getTotal () {
      const objects = await s3.listObjects({
        Bucket: bucket,
        Prefix: id
      }).promise()
      return objects.Contents.length
    },

    async clear () {
      const objects = await s3.listObjects({
        Bucket: bucket,
        Prefix: id
      }).promise()
      return Promise.all(objects.Contents
        .map(t => s3.deleteObject({
          Bucket: bucket,
          Key: t.Key
        }).promise()))
    }
  }
}
