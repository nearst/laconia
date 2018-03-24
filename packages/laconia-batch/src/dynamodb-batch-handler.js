const AWS = require('aws-sdk')
const DynamoDbItemReader = require('./DynamoDbItemReader')
const baseBatchHandler = require('./base-batch-handler')

module.exports =
  ({
    readerOptions: {
      operation,
      dynamoDbParams,
      documentClient = new AWS.DynamoDB.DocumentClient()
    },
    batchOptions = {}
  }) =>
  baseBatchHandler(
    new DynamoDbItemReader(operation, documentClient, dynamoDbParams),
    batchOptions
  )
