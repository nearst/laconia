const laconiaEvent = require("@laconia/event").sqsJson();
const { spy } = require("@laconia/test");

const handler = async orderEvents => {
  console.log(orderEvents);
};

module.exports.handler = laconiaEvent(spy(handler)).register(spy.instances());
