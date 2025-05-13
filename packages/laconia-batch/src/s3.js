const { S3Client } = require("@aws-sdk/client-s3");
const S3ItemReader = require("./S3ItemReader");

module.exports = ({ s3Params, path, s3 = new S3Client({}) }) =>
  new S3ItemReader(s3, s3Params, path);
