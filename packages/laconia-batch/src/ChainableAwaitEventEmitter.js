const AwaitEventEmitter = require("await-event-emitter").default;

module.exports = class ChainableAwaitEventEmitter extends AwaitEventEmitter {
  on(type, fn) {
    super.on(type, fn);
    return this;
  }
};
