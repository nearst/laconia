const laconia = require("@laconia/core");
const BatchProcessor = require("./BatchProcessor");
const recurse = require("./recurse");
const EventEmitter = require("./ChainableAwaitEventEmitter");

const forwardEvents = (from, eventNames, to, laconiaContext) => {
  eventNames.forEach(eventName =>
    from.on(eventName, (...args) => to.emit(eventName, laconiaContext, ...args))
  );
};

const isBatchProcessingNotStarted = cursor => !cursor;

module.exports = (
  reader,
  { timeNeededToRecurseInMillis = 5000, itemsPerSecond } = {}
) => {
  const eventEmitter = new EventEmitter();

  const handler = laconia(async (event, laconiaContext) => {
    const { context } = laconiaContext;
    const itemReader = reader(laconiaContext);
    const batchProcessor = new BatchProcessor(
      itemReader.next.bind(itemReader),
      cursor =>
        context.getRemainingTimeInMillis() <= timeNeededToRecurseInMillis,
      { itemsPerSecond }
    ).on("stop", cursor => {
      recurse(laconiaContext)({ cursor });
    });
    forwardEvents(
      batchProcessor,
      ["stop", "item", "end"],
      eventEmitter,
      laconiaContext
    );

    if (isBatchProcessingNotStarted(event.cursor)) {
      await eventEmitter.emit("start", laconiaContext);
    }
    return batchProcessor.start(event.cursor);
  });

  return Object.assign(handler, {
    on: (eventName, listener) => {
      eventEmitter.on(eventName, listener);
      return handler;
    }
  });
};
