const AWS = require('aws-sdk')
const S3ItemReader = require('./S3ItemReader')
const baseBatchHandler = require('./base-batch-handler')

module.exports =
  (path, params,
    {
      s3 = new AWS.S3(),
      timeNeededToRecurseInMillis = 5000
    } = {}) =>
  baseBatchHandler(
    new S3ItemReader(s3, params, path),
    {timeNeededToRecurseInMillis}
  )
