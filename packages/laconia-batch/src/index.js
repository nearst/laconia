const laconiaBatch = require("./laconiaBatch");
const s3 = require("./s3");
const dynamoDb = require("./dynamoDb");

module.exports = exports = laconiaBatch;
exports.default = laconiaBatch;

exports.s3 = s3;
exports.dynamoDb = dynamoDb;
