module.exports = class BooleanConfigFactory {
  constructor(config) {
    this.config = config;
  }

  makeInstances() {
    return Object.keys(this.config).reduce((acc, configKey) => {
      acc[configKey] = this._makeInstance(this.config[configKey]);
      return acc;
    }, {});
  }

  _makeInstance(value) {
    const falsyValues = ["false", "null", "undefined", "0", "", "no", "off"];
    return !falsyValues.includes(value.toLowerCase().trim());
  }
};
