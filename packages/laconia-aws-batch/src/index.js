const { LambdaInvoker } = require('@laconia/aws-lambda-invoke')
const AWS = require('aws-sdk')
const BatchProcessor = require('./BatchProcessor')
const DynamoDbItemReader = require('./DynamoDbItemReader')

const recursiveHandler = (handler) => async (event, context, callback) => {
  const recurse = (response) => { new LambdaInvoker(new AWS.Lambda(), context.functionName).fireAndForget(response) }
  await handler(event, context, recurse)
}

module.exports.dynamoDbBatchHandler =
  (operation, dynamoParams, processItem,
    {
      documentClient = new AWS.DynamoDB.DocumentClient(),
      timeNeededToRecurseInMillis = 5000
    } = {}) =>
  recursiveHandler(async (event, context, recurse) => {
    const itemReader = new DynamoDbItemReader(operation, documentClient, dynamoParams)
    const batchProcessor = new BatchProcessor(
      itemReader.next.bind(itemReader),
      (item) => processItem(item, event, context),
      (cursor) => context.getRemainingTimeInMillis() > timeNeededToRecurseInMillis
    )
    .on('inProgress', (cursor) => recurse({ cursor }))

    await batchProcessor.start(event.cursor)
  })
