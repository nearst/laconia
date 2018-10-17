const { EnvVarInstanceFactory } = require("@laconia/core");

module.exports = class EnvVarBooleanConfigFactory extends EnvVarInstanceFactory {
  constructor(env) {
    super(env, "LACONIA_BOOLEANCONFIG_");
  }

  _makeInstance(value) {
    const falsyValues = ["false", "null", "undefined", "0", "", "no", "off"];
    return !falsyValues.includes(value.toLowerCase().trim());
  }
};
