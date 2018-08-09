const invoke = require("./invoke");

const macroCaseToCamelCase = str =>
  str.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());

module.exports = class EnvVarInvokeFactory {
  constructor(env) {
    this.env = env;
  }

  makeInstances() {
    return Object.keys(this.env)
      .filter(k => k.startsWith("LACONIA_INVOKE"))
      .reduce((acc, k) => {
        const key = macroCaseToCamelCase(k.replace("LACONIA_INVOKE_", ""));
        acc[key] = invoke(this.env[k]);
        return acc;
      }, {});
  }
};
