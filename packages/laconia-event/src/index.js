const S3InputConverter = require("./S3InputConverter");

exports.s3 = () => () => ({ $inputConverter: new S3InputConverter() });
