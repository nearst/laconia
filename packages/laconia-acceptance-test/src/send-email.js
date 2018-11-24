const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async orderEvents => {
  console.log(orderEvents);
};

module.exports.handler = laconia(handler).register(event.sqsJson());
