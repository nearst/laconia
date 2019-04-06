const S3Event = require("./S3Event");
const SqsEvent = require("./SqsEvent");
const KinesisEvent = require("./KinesisEvent");
const SnsEvent = require("./SnsEvent");
const ApiGatewayEvent = require("./apigateway/ApiGatewayEvent");
const ApiGatewayResponse = require("./apigateway/ApiGatewayResponse");

exports.s3 = S3Event.fromRaw;
exports.sqs = SqsEvent.fromRaw;
exports.kinesis = KinesisEvent.fromRaw;
exports.sns = SnsEvent.fromRaw;
exports.apigateway = {
  req: ApiGatewayEvent.fromRaw,
  res: ApiGatewayResponse.create
};
