const { laconia, recurse } = require("laconia-core");
const BatchProcessor = require("./BatchProcessor");
const EventEmitter = require("events");

const forwardEvents = (from, eventNames, to, laconiaContext) => {
  eventNames.forEach(eventName =>
    from.on(eventName, (...args) => to.emit(eventName, laconiaContext, ...args))
  );
};

module.exports = (
  reader,
  { timeNeededToRecurseInMillis = 5000, itemsPerSecond } = {}
) => {
  const handler = laconia(laconiaContext => {
    const { event, context } = laconiaContext;
    const itemReader = reader(laconiaContext);
    const batchProcessor = new BatchProcessor(
      itemReader.next.bind(itemReader),
      cursor =>
        context.getRemainingTimeInMillis() <= timeNeededToRecurseInMillis,
      { itemsPerSecond }
    ).on("stop", cursor => {
      recurse({ cursor })(laconiaContext);
    });
    forwardEvents(
      batchProcessor,
      ["stop", "item", "end"],
      handler,
      laconiaContext
    );

    handler.emit("start", laconiaContext);
    return batchProcessor.start(event.cursor);
  });
  return Object.assign(handler, EventEmitter.prototype);
};
