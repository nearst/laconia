const { laconia } = require("laconia-core");
const testHelper = require("laconia-test-helper");

const instances = lc => ({
  tracker: testHelper.tracker(lc.context.functionName)
});

module.exports.handler = laconia(async ({ tracker, event }) => {
  await tracker.tick(event);
}).register(instances);
