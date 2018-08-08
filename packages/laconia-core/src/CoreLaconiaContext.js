const LaconiaContext = require("./LaconiaContext");

module.exports = class CoreLaconiaContext extends LaconiaContext {
  constructor(baseContext) {
    super(baseContext);
    const coreComponents = {
      env: process.env
    };
    this.register(coreComponents);
    this._registerWithPrefix(coreComponents);
  }
};
