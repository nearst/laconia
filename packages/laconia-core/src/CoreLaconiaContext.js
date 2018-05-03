const LaconiaContext = require("./LaconiaContext");
const invoke = require("./invoke");
const recurse = require("./recurse");

module.exports = class CoreLaconiaContext extends LaconiaContext {
  constructor(baseContext) {
    super(baseContext);
    const coreComponents = {
      invoke,
      recurse: recurse(baseContext),
      env: process.env
    };
    this.register(coreComponents);
    this._registerWithPrefix(coreComponents);
  }
};
