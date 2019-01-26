const createLaconiaEventHandler = require("./createLaconiaEventHandler");
const KinesisJsonInputConverter = require("./KinesisJsonInputConverter");
const SnsJsonInputConverter = require("./SnsJsonInputConverter");
const SqsJsonInputConverter = require("./SqsJsonInputConverter");

const createS3EventAdapter = require("./createS3EventAdapter");

exports.kinesisJson = () =>
  createLaconiaEventHandler(() => new KinesisJsonInputConverter());
exports.snsJson = () =>
  createLaconiaEventHandler(() => new SnsJsonInputConverter());
exports.sqsJson = () =>
  createLaconiaEventHandler(() => new SqsJsonInputConverter());

exports.s3 = createS3EventAdapter;
