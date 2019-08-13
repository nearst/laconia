// @ts-check
const laconia = require("@laconia/core");
const sqs = require("@laconia/adapter").sqs();
const { spy } = require("@laconia/test");

const app = async orderEvents => {
  console.log(orderEvents);
};

exports.handler = laconia(sqs(spy(app))).register(spy.instances());
