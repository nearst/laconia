const { laconia } = require("laconia-core");
const testHelper = require("laconia-test-helper");

const instances = ({ context }) => ({
  tracker: testHelper.tracker(context.functionName)
});

module.exports.handler = laconia(async ({ tracker, event }) => {
  if (!event.paymentReference) {
    throw new Error("paymentReference is required");
  }
  await tracker.tick(event);
}).register(instances);
