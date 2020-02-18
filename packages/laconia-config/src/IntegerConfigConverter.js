module.exports = class IntegerConfigConverter {
  convertMultiple(values) {
    return Object.keys(values).reduce((acc, key) => {
      acc[key] = parseInt(values[key], 10);
      return acc;
    }, {});
  }
};
