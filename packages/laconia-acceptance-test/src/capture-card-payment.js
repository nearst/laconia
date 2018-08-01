const { laconia } = require("laconia-core");
const { spy, LaconiaContextSpierFactory } = require("laconia-test");

const instances = lc => ({
  $spierFactory: new LaconiaContextSpierFactory(lc)
});

const handler = async ({ tracker, event }) => {
  if (!event.paymentReference) {
    throw new Error("paymentReference is required");
  }
};

module.exports.handler = laconia(spy(handler)).register(instances);
