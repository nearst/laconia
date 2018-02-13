const { LambdaInvoker } = require("@laconia/aws-invoke");
const AWS = require("aws-sdk");
const BatchProcessor = require("./BatchProcessor");
const DynamoDbItemReader = require("./DynamoDbItemReader");
const EventEmitter = require("events");

const recursiveHandler = handler => (event, context, callback) => {
  const recurse = response => {
    new LambdaInvoker(context.functionName).fireAndForget(response);
  };
  return handler(event, context, recurse);
};

const forwardEvents = (from, eventNames, to) => {
  eventNames.forEach(eventName =>
    from.on(eventName, (...args) => to.emit(eventName, ...args))
  );
};

module.exports.dynamoDbBatchHandler = (
  operation,
  dynamoParams,
  {
    documentClient = new AWS.DynamoDB.DocumentClient(),
    timeNeededToRecurseInMillis = 5000
  } = {}
) => {
  const handler = recursiveHandler((event, context, recurse) => {
    const itemReader = new DynamoDbItemReader(
      operation,
      documentClient,
      dynamoParams
    );
    const batchProcessor = new BatchProcessor(
      itemReader.next.bind(itemReader),
      cursor =>
        context.getRemainingTimeInMillis() <= timeNeededToRecurseInMillis
    ).on("stop", cursor => {
      recurse({ cursor });
    });
    forwardEvents(batchProcessor, ["stop", "item", "end"], handler);

    handler.emit("start", event, context);
    return batchProcessor.start(event.cursor);
  });
  return Object.assign(handler, EventEmitter.prototype);
};
