// @ts-check
const laconia = require("@laconia/core");
const { spy } = require("@laconia/test");

exports.app = async event => {
  if (!event.paymentReference) {
    throw new Error("paymentReference is required");
  }
};

exports.handler = laconia(spy(exports.app)).register(spy.instances());
