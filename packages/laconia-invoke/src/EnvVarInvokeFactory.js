const { EnvVarInstanceFactory } = require("@laconia/core");
const invoke = require("./invoke");

module.exports = class EnvVarInvokeFactory extends EnvVarInstanceFactory {
  constructor(env) {
    super(env, "LACONIA_INVOKE_");
  }

  _makeInstance(value, options) {
    return invoke(value, options);
  }
};
