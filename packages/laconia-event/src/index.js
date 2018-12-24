const createLaconiaEventHandler = require("./createLaconiaEventHandler");
const S3EventInputConverter = require("./S3EventInputConverter");
const S3StreamInputConverter = require("./S3StreamInputConverter");
const S3JsonInputConverter = require("./S3JsonInputConverter");
const KinesisJsonInputConverter = require("./KinesisJsonInputConverter");
const SnsJsonInputConverter = require("./SnsJsonInputConverter");
const SqsJsonInputConverter = require("./SqsJsonInputConverter");

exports.s3Event = () =>
  createLaconiaEventHandler(() => new S3EventInputConverter());
exports.s3Stream = () =>
  createLaconiaEventHandler(({ $s3 }) => new S3StreamInputConverter($s3));
exports.s3Json = () =>
  createLaconiaEventHandler(({ $s3 }) => new S3JsonInputConverter($s3));
exports.kinesisJson = () =>
  createLaconiaEventHandler(() => new KinesisJsonInputConverter());
exports.snsJson = () =>
  createLaconiaEventHandler(() => new SnsJsonInputConverter());
exports.sqsJson = () =>
  createLaconiaEventHandler(() => new SqsJsonInputConverter());
