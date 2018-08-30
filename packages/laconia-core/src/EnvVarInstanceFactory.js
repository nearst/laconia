const macroCaseToCamelCase = str =>
  str.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());

module.exports = class EnvVarInstanceFactory {
  constructor(env, prefix) {
    this.env = env;
    this.prefix = prefix;
  }

  _toObjKey(envKey) {
    return macroCaseToCamelCase(envKey.replace(this.prefix, ""));
  }

  _getEnvVar() {
    return Object.keys(this.env)
      .filter(k => k.startsWith(this.prefix))
      .reduce((envVar, k) => {
        envVar[k] = this.env[k];
        return envVar;
      }, {});
  }

  _makeInstance(value, options) {}
  _preMakeInstance() {}

  async makeInstances(options) {
    const envVar = this._getEnvVar();
    if (Object.keys(envVar).length === 0) return {};

    await this._preMakeInstance(envVar);
    return Object.keys(envVar).reduce((acc, envKey) => {
      acc[this._toObjKey(envKey)] = this._makeInstance(envVar[envKey], options);
      return acc;
    }, {});
  }
};
