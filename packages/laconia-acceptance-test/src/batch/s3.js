const { s3BatchHandler } = require('laconia-batch')
const tracker = require('laconia-test-helper').tracker('batch-s3')

module.exports.handler = s3BatchHandler({
  readerOptions: {
    path: '.',
    s3Params: {
      Bucket: process.env['TEST_BUCKET_NAME'],
      Key: 'batch-s3.json'
    }
  },
  batchOptions: { itemsPerSecond: 2 }
})
.on('item', (laconiaContext, item) => tracker.tick({laconiaContext, item}))
