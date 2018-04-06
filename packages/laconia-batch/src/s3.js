const AWS = require('aws-sdk')
const S3ItemReader = require('./S3ItemReader')

module.exports = ({
  path,
  s3Params,
  s3 = new AWS.S3()
}) => new S3ItemReader(s3, s3Params, path)
