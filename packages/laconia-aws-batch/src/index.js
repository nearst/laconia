const { LambdaInvoker } = require("@laconia/aws-lambda-invoke");
const AWS = require("aws-sdk");
const BatchProcessor = require("./BatchProcessor");
const DynamoDbItemReader = require("./DynamoDbItemReader");

const recurse = handler => async (event, context, callback) => {
  const response = await handler(event, context, callback);
  new LambdaInvoker(new AWS.Lambda(), context.functionName).fireAndForget(
    response
  );
};

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
    const itemReader = new DynamoDbItemReader(
      operation,
      documentClient,
      dynamoParams
    );
    const batchProcessor = new BatchProcessor(
      itemReader.next.bind(itemReader),
      item => itemProcessor(item, event, context),
      cursor => context.getRemainingTimeInMillis() > timeNeededToRecurseInMillis
    );
    const cursor = await batchProcessor.start(event.cursor);

    return { cursor };
  });
