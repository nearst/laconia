const AWS = require('aws-sdk')
const DynamoDbItemReader = require('./DynamoDbItemReader')
const baseBatchHandler = require('./base-batch-handler')

module.exports.dynamoDbBatchHandler =
  (operation, dynamoParams,
    {
      documentClient = new AWS.DynamoDB.DocumentClient(),
      timeNeededToRecurseInMillis = 5000
    } = {}) =>
  baseBatchHandler(
    new DynamoDbItemReader(operation, documentClient, dynamoParams),
    {timeNeededToRecurseInMillis}
  )
