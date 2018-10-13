const { EnvVarInstanceFactory } = require("@laconia/core");
const invoker = require("./invoker");

module.exports = class EnvVarInvokerFactory extends EnvVarInstanceFactory {
  constructor(env, lambda) {
    super(env, "LACONIA_INVOKER_");
    this.lambda = lambda;
  }

  _makeInstance(value, options) {
    return invoker(value, this.lambda, options);
  }
};
