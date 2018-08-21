const macroCaseToCamelCase = str =>
  str.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());

module.exports = class EnvVarSsmSecretFactory {
  constructor(env) {
    this.env = env;
  }

  makeInstances() {
    return Object.keys(this.env)
      .filter(k => k.startsWith("LACONIA_SSM"))
      .reduce((acc, k) => {
        const key = macroCaseToCamelCase(k.replace("LACONIA_SSM_", ""));
        acc[key] = null;
        return acc;
      }, {});
  }
};
