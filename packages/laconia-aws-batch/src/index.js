const { LambdaInvoker } = require('@laconia/aws-lambda-invoke')
const AWS = require('aws-sdk')
const BatchProcessor = require('./BatchProcessor')
const DynamoDbItemReader = require('./DynamoDbItemReader')
const EventEmitter = require('events')

const recursiveHandler = (handler) => (event, context, callback) => {
  const recurse = (response) => { new LambdaInvoker(context.functionName).fireAndForget(response) }
  return handler(event, context, recurse)
}

module.exports.dynamoDbBatchHandler =
  (operation, dynamoParams,
    {
      documentClient = new AWS.DynamoDB.DocumentClient(),
      timeNeededToRecurseInMillis = 5000
    } = {}) => {
    const handler = recursiveHandler((event, context, recurse) => {
      const itemReader = new DynamoDbItemReader(operation, documentClient, dynamoParams)
      const batchProcessor = new BatchProcessor(
        itemReader.next.bind(itemReader),
        (cursor) => context.getRemainingTimeInMillis() <= timeNeededToRecurseInMillis
      )
      .on('stop', (cursor) => { handler.emit('stop', cursor); recurse({ cursor }) })
      .on('item', (item) => handler.emit('item', item, event, context))
      .on('end', () => handler.emit('end'))

      return batchProcessor.start(event.cursor)
    })
    return Object.assign(handler, EventEmitter.prototype)
  }
