const laconia = require("@laconia/core");
const event = require("@laconia/event");
const { spy } = require("@laconia/test");

const handler = async orderEvents => {
  console.log(orderEvents);
};

module.exports.handler = laconia(spy(handler))
  .register(event.sqsJson())
  .register(spy.instances());
