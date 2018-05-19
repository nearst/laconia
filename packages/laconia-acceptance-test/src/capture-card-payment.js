const { laconia } = require("laconia-core");
const testHelper = require("laconia-test-helper");

module.exports.handler = laconia(async ({ tracker, event }) => {
  await tracker.tick(event);
}).on("init", lc => {
  lc.register({
    tracker: testHelper.tracker(lc.context.functionName)
  });
});
