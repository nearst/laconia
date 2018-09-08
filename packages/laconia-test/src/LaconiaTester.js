const { HandledInvokeLaconiaError } = require("@laconia/invoker");

module.exports = class LaconiaTester {
  constructor(invoker, { logger = console.log } = {}) {
    this.invoker = invoker;
    this.logger = logger;
  }

  async requestResponse() {
    try {
      return await this.invoker.requestResponse(...arguments);
    } catch (err) {
      if (err instanceof HandledInvokeLaconiaError) {
        this.logger(`${err.functionName} Lambda logs:\n${err.logs}`);
      }
      throw err;
    }
  }

  fireAndForget() {
    return this.invoker.fireAndForget(...arguments);
  }
};
