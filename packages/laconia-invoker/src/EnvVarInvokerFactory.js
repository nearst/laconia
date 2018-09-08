const { EnvVarInstanceFactory } = require("@laconia/core");
const invoker = require("./invoker");

module.exports = class EnvVarInvokerFactory extends EnvVarInstanceFactory {
  constructor(env) {
    super(env, "LACONIA_INVOKER_");
  }

  _makeInstance(value, options) {
    return invoker(value, options);
  }
};
