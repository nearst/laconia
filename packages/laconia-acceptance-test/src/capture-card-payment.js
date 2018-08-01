const { laconia } = require("laconia-core");
const { spy, LaconiaContextSpierFactory, tracker } = require("laconia-test");

const instances = lc => ({
  $spierFactory: new LaconiaContextSpierFactory(lc),
  tracker: tracker(lc.context.functionName)
});

const handler = async ({ tracker, event }) => {
  if (!event.paymentReference) {
    throw new Error("paymentReference is required");
  }
  await tracker.tick(event);
};

module.exports.handler = laconia(spy(handler)).register(instances);
