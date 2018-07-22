const { HandledInvokeLaconiaError } = require("laconia-core");

module.exports = class LaconiaTester {
  constructor(invoker, { logger = console.log } = {}) {
    this.invoker = invoker;
    this.logger = logger;
  }

  async requestResponse() {
    try {
      return await this.invoker.requestResponse(...arguments);
    } catch (err) {
      this.logger(err.logs);
      throw err;
    }
  }
};
