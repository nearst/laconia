const { LambdaInvoker } = require('@laconia/aws-lambda-invoke')
const AWS = require('aws-sdk')

module.exports.DynamoDbItemReader = class DynamoDbItemReader {
  constructor (documentClient, baseParams) {
    this.documentClient = documentClient
    this.baseParams = baseParams
  }

  async next (cursor = {}) {
    const params = Object.assign({
      Limit: 1
    }, this.baseParams)
    if (cursor.lastEvaluatedKey) {
      params.ExclusiveStartKey = cursor.lastEvaluatedKey
    }
    const data = await this.documentClient.scan(params).promise()
    return {
      item: data.Items[0],
      cursor: { lastEvaluatedKey: data.LastEvaluatedKey },
      finished: cursor.lastEvaluatedKey === undefined
    }
  }
}

module.exports.BatchProcessor = class BatchProcessor {
  constructor (context, itemReader, itemProcessor, options) {
    this.context = context
    this.itemReader = itemReader
    this.itemProcessor = itemProcessor
    this.options = Object.assign({}, options)
  }

  async start (cursor = {}) {
    let newCursor = cursor

    do {
      const next = await this.itemReader.next(newCursor)
      const item = next.item
      newCursor = next.cursor
      if (item) {
        this.itemProcessor(item)
      } else {
        break
      }
    } while (this.shouldContinue(newCursor))

    if (!newCursor.finished) {
      this.notFinished(newCursor)
    }
  }

  shouldContinue (cursor) { // TODO: Rename method and externalise
    return this.context.getRemainingTimeInMillis() > this.options.timeNeededToRecurseInMillis
  }

  notFinished (cursor) { // TODO: Rename method and externalise
    new LambdaInvoker(new AWS.Lambda(), this.context.functionName).fireAndForget({cursor})
  }
}
