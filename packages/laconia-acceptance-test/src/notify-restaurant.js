const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async orders => {
  console.log(orders);
};

module.exports.handler = laconia(handler).register(event.kinesisJson());
