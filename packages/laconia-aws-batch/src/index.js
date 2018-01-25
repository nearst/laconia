const { LambdaInvoker } = require("@laconia/aws-lambda-invoke");
const AWS = require("aws-sdk");

module.exports.DynamoDbItemReader = class DynamoDbItemReader {
  constructor(operation, documentClient, baseParams) {
    this.operation = operation; // TODO: validate operation
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
    const data =
      this.operation === exports.QUERY
        ? await this.documentClient.query(params).promise()
        : await this.documentClient.scan(params).promise();

    return {
      item: data.Items[0],
      cursor: { lastEvaluatedKey: data.LastEvaluatedKey },
      finished: data.LastEvaluatedKey === undefined
    };
  }
};

module.exports.BatchProcessor = class BatchProcessor {
  constructor(itemReader, itemProcessor, shouldContinue) {
    this.itemReader = itemReader;
    this.itemProcessor = itemProcessor;
    this.shouldContinue = shouldContinue;
  }

  async start(cursor = {}) {
    let newCursor = cursor;

    do {
      const next = await this.itemReader.next(newCursor);
      const item = next.item;
      newCursor = next.cursor;
      if (item) {
        this.itemProcessor(item);
      } else {
        break;
      }

      if (next.finished) {
        break;
      }
    } while (this.shouldContinue(newCursor));

    if (!newCursor.finished) {
      // TODO: This has never worked, newCursor doesn't have finished property
      return newCursor;
    }
  }
};

const recurse = handler => async (event, context, callback) => {
  const response = await handler(event, context, callback);
  new LambdaInvoker(new AWS.Lambda(), context.functionName).fireAndForget(
    response
  );
};

module.exports.SCAN = "SCAN";
module.exports.QUERY = "QUERY";

module.exports.dynamoDbBatchHandler = (
  operation,
  dynamoParams,
  itemProcessor,
  {
    documentClient = new AWS.DynamoDB.DocumentClient(),
    timeNeededToRecurseInMillis = 5000
  } = {}
) =>
  recurse(async (event, context, callback) => {
    const batchProcessor = new exports.BatchProcessor(
      new exports.DynamoDbItemReader(operation, documentClient, dynamoParams),
      item => itemProcessor(item, event, context),
      cursor => context.getRemainingTimeInMillis() > timeNeededToRecurseInMillis
    );
    const cursor = await batchProcessor.start(event.cursor);

    return { cursor };
  });
