const laconia = require("@laconia/core");
const { spy } = require("@laconia/test");

const handler = async ({ event }) => {
  if (!event.paymentReference) {
    throw new Error("paymentReference is required");
  }
};

module.exports.handler = laconia(spy(handler)).register(spy.instances());
