const S3Event = require("./S3Event");
const SqsEvent = require("./SqsEvent");
const KinesisEvent = require("./KinesisEvent");
const SnsEvent = require("./SnsEvent");

exports.s3 = event => S3Event.fromRaw(event);
exports.sqs = event => SqsEvent.fromRaw(event);
exports.kinesis = event => KinesisEvent.fromRaw(event);
exports.sns = event => SnsEvent.fromRaw(event);
