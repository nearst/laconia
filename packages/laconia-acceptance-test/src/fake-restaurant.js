const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async order => {
  console.log("order", order);
};

module.exports.handler = laconia(handler).register(event.snsJson());
