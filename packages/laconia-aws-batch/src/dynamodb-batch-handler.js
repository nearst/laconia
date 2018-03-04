const AWS = require('aws-sdk')
const DynamoDbItemReader = require('./DynamoDbItemReader')
const baseBatchHandler = require('./base-batch-handler')

module.exports =
  (operation, dynamoParams,
    {
      documentClient = new AWS.DynamoDB.DocumentClient(),
      ...options
    } = {}) =>
  baseBatchHandler(
    new DynamoDbItemReader(operation, documentClient, dynamoParams),
    options
  )
