const { laconia } = require("laconia-core");
const { tracker } = require("laconia-test");

const instances = ({ context }) => ({
  tracker: tracker(context.functionName)
});

module.exports.handler = laconia(async ({ tracker, event }) => {
  if (!event.paymentReference) {
    throw new Error("paymentReference is required");
  }
  await tracker.tick(event);
}).register(instances);
