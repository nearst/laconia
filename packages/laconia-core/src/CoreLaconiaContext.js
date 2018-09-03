const LaconiaContext = require("./LaconiaContext");

module.exports = class CoreLaconiaContext extends LaconiaContext {
  constructor(baseContext) {
    super(baseContext);
    const coreInstances = {
      env: process.env
    };
    this.registerInstances(coreInstances);
    this._registerInstancesWithPrefix(coreInstances);
  }
};
