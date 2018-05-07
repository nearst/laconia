const { laconia } = require("laconia-core");
const BatchProcessor = require("./BatchProcessor");

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
    const { event, context, recurse } = laconiaContext;
    const itemReader = reader(laconiaContext);
    const batchProcessor = new BatchProcessor(
      itemReader.next.bind(itemReader),
      cursor =>
        context.getRemainingTimeInMillis() <= timeNeededToRecurseInMillis,
      { itemsPerSecond }
    ).on("stop", cursor => {
      recurse({ cursor });
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
  return handler;
};
