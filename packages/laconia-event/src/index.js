const laconiaEvent = require("./laconiaEvent");
const S3EventInputConverter = require("./S3EventInputConverter");
const S3StreamInputConverter = require("./S3StreamInputConverter");
const S3JsonInputConverter = require("./S3JsonInputConverter");
const KinesisJsonInputConverter = require("./KinesisJsonInputConverter");
const SnsJsonInputConverter = require("./SnsJsonInputConverter");
const SqsJsonInputConverter = require("./SqsJsonInputConverter");

exports.s3Event = () => laconiaEvent(() => new S3EventInputConverter());
exports.s3Stream = () =>
  laconiaEvent(({ $s3 }) => new S3StreamInputConverter($s3));
exports.s3Json = () => laconiaEvent(({ $s3 }) => new S3JsonInputConverter($s3));
exports.kinesisJson = () => laconiaEvent(() => new KinesisJsonInputConverter());
exports.snsJson = () => laconiaEvent(() => new SnsJsonInputConverter());
exports.sqsJson = () => laconiaEvent(() => new SqsJsonInputConverter());
