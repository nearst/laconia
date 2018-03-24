const AWS = require("aws-sdk");
const S3ItemReader = require("./S3ItemReader");
const baseBatchHandler = require("./base-batch-handler");

module.exports = ({
  readerOptions: { path, s3Params, s3 = new AWS.S3() },
  batchOptions = {}
}) => baseBatchHandler(new S3ItemReader(s3, s3Params, path), batchOptions);
