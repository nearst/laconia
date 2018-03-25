const { recursiveHandler } = require("laconia-handler");
const tracker = require("laconia-test-helper").tracker("recursive");

module.exports.handler = recursiveHandler((laconiaContext, recurse) => {
  return tracker.tick().then(_ => {
    const { event } = laconiaContext;
    if (event.input !== 3) {
      return recurse({ input: event.input + 1 });
    }
  });
});
