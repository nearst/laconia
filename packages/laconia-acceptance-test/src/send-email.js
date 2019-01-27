const laconia = require("@laconia/core");
const sqs = require("@laconia/event").sqs();
const { spy } = require("@laconia/test");

const handler = async orderEvents => {
  console.log(orderEvents);
};

module.exports.handler = laconia(sqs(spy(handler))).register(spy.instances());
