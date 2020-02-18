module.exports = class FloatConfigConverter {
  convertMultiple(values) {
    return Object.keys(values).reduce((acc, key) => {
      acc[key] = parseFloat(values[key]);
      return acc;
    }, {});
  }
};
