const LaconiaContext = require("./LaconiaContext");
const invoke = require("./invoke");
const recurse = require("./recurse");

module.exports = class CoreLaconiaContext extends LaconiaContext {
  constructor(baseContext) {
    super(baseContext);
    const coreMembers = {
      invoke,
      recurse: recurse(baseContext),
      env: process.env
    };
    this.inject(baseContext);
    this.inject(coreMembers);
    this._injectWithPrefix(coreMembers);
  }
};
