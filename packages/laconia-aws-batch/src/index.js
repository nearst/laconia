
module.exports.DynamoDbItemReader = class DynamoDbItemReader {
  constructor (documentClient, baseParams) {
    this.documentClient = documentClient
    this.baseParams = baseParams
    this.lastEvaluatedKey = undefined
  }

  async next () {
    const params = Object.assign({
      Limit: 1
    }, this.baseParams)
    if (this.lastEvaluatedKey) {
      params.ExclusiveStartKey = this.lastEvaluatedKey
    }
    const data = await this.documentClient.scan(params).promise()
    this.lastEvaluatedKey = data.LastEvaluatedKey
    return data.Items[0]
  }
}

module.exports.BatchProcessor = class BatchProcessor {
  constructor (itemReader, itemProcessor, batchSize) {
    this.itemReader = itemReader
    this.itemProcessor = itemProcessor
    this.batchSize = batchSize
    this.processedItemCount = 0
  }

  async start () {
    while (this.batchSize ? this.processedItemCount < this.batchSize : true) {
      const item = await this.itemReader.next()
      if (item) {
        this.itemProcessor(item)
        this.processedItemCount++
      } else {
        break
      }
    }
  }
}
