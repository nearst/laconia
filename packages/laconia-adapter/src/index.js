const KinesisJsonInputConverter = require("./KinesisJsonInputConverter");
const DynamoDbStreamJsonInputConvertor = require("./DynamoDbStreamJsonInputConvertor");
const SnsJsonInputConverter = require("./SnsJsonInputConverter");
const SqsJsonInputConverter = require("./SqsJsonInputConverter");
const createS3EventAdapter = require("./createS3EventAdapter");
const createEventAdapter = require("./createEventAdapter");

exports.sns = createEventAdapter(new SnsJsonInputConverter());
exports.sqs = createEventAdapter(new SqsJsonInputConverter());
exports.kinesis = createEventAdapter(new KinesisJsonInputConverter());
exports.dynamodb = createEventAdapter(new DynamoDbStreamJsonInputConvertor());

exports.s3 = createS3EventAdapter;
