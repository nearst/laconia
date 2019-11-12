const laconia = require("@laconia/core");
const BatchProcessor = require("./BatchProcessor");
const recurse = require("./recurse");
const EventEmitter = require("events");

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
  const handler = laconia((event, laconiaContext) => {
    const { context } = laconiaContext;
    const itemReader = reader(laconiaContext);
    const batchProcessor = new BatchProcessor(
      itemReader.next.bind(itemReader),
      cursor =>
        context.getRemainingTimeInMillis() <= timeNeededToRecurseInMillis,
      { itemsPerSecond }
    ).on("stop", cursor => {
      return recurse(laconiaContext)({ cursor });
    });
    forwardEvents(
      batchProcessor,
      ["stop", "item", "end"],
      handler,
      laconiaContext
    );

    if (isBatchProcessingNotStarted(event.cursor)) {
      handler.emit("start", laconiaContext);
    }
    return batchProcessor.start(event.cursor);
  });
  return Object.assign(handler, EventEmitter.prototype);
};
