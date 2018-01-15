module.exports.DynamoDbItemReader = class DynamoDbItemReader {
  constructor(documentClient, baseParams) {
    this.documentClient = documentClient;
    this.baseParams = baseParams;
  }

  async next(cursor = {}) {
    const params = Object.assign(
      {
        Limit: 1
      },
      this.baseParams
    );
    if (cursor.lastEvaluatedKey) {
      params.ExclusiveStartKey = cursor.lastEvaluatedKey;
    }
    const data = await this.documentClient.scan(params).promise();
    return {
      item: data.Items[0],
      cursor: { lastEvaluatedKey: data.LastEvaluatedKey }
    };
  }
};

module.exports.BatchProcessor = class BatchProcessor {
  constructor(itemReader, itemProcessor, batchSize) {
    this.itemReader = itemReader;
    this.itemProcessor = itemProcessor;
    this.batchSize = batchSize;
    this.processedItemCount = 0;
  }

  async start(cursor = {}) {
    let newCursor = cursor;
    while (this.batchSize ? this.processedItemCount < this.batchSize : true) {
      const next = await this.itemReader.next(newCursor);
      const item = next.item;
      newCursor = next.cursor;
      if (item) {
        this.itemProcessor(item);
        this.processedItemCount++;
      } else {
        break;
      }
    }
  }
};
