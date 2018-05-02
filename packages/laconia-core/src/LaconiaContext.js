const prefixKeys = (prefix, object) => {
  const keyValues = Object.keys(object).map(key => {
    const newKey = `${prefix}${key}`;
    return { [newKey]: object[key] };
  });
  return Object.assign({}, ...keyValues);
};

module.exports = class LaconiaContext {
  constructor(baseContext) {
    this.inject(baseContext);
  }

  inject(instance) {
    Object.keys(instance).forEach(key => {
      this[key] = instance[key];
    });
  }

  _injectWithPrefix(instance) {
    this.inject(prefixKeys("$", instance));
  }
};
