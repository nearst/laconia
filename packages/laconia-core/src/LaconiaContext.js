const prefixKeys = (prefix, object) => {
  const keyValues = Object.keys(object).map(key => {
    const newKey = `${prefix}${key}`;
    return { [newKey]: object[key] };
  });
  return Object.assign({}, ...keyValues);
};

module.exports = class LaconiaContext {
  constructor(baseContext) {
    this.register(baseContext);
  }

  register(instance) {
    Object.keys(instance).forEach(key => {
      this[key] = instance[key];
    });
  }

  _registerWithPrefix(instance) {
    this.register(prefixKeys("$", instance));
  }
};
