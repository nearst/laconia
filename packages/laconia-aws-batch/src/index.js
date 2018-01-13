module.exports.DynamoDbItemReader = class DynamoDbItemReader {
  constructor(documentClient, baseParams) {
    this.documentClient = documentClient;
    this.baseParams = baseParams;
    this.lastEvaluatedKey = undefined;
  }

  async next() {
    const params = Object.assign(
      {
        Limit: 1
      },
      this.baseParams
    );
    if (this.lastEvaluatedKey) {
      params.ExclusiveStartKey = this.lastEvaluatedKey;
    }
    const data = await this.documentClient.scan(params).promise();
    this.lastEvaluatedKey = data.LastEvaluatedKey;
    return data.Items[0];
  }
};

module.exports.BatchProcessor = class BatchProcessor {
  constructor(itemReader, itemProcessor) {
    this.itemReader = itemReader;
    this.itemProcessor = itemProcessor;
  }

  async start() {
    while (true) {
      const item = await this.itemReader.next();
      if (item) {
        this.itemProcessor(item);
      } else {
        break;
      }
    }
  }
};
