const S3EventInputConverter = require("./S3EventInputConverter");
const S3StreamInputConverter = require("./S3StreamInputConverter");

exports.s3Event = () => ({ $s3 }) => ({
  $inputConverter: new S3EventInputConverter($s3)
});

exports.s3Stream = () => ({ $s3 }) => ({
  $inputConverter: new S3StreamInputConverter($s3)
});
