const S3InputConverter = require("./S3InputConverter");

exports.s3Event = () => ({ $s3 }) => ({
  $inputConverter: new S3InputConverter($s3)
});
