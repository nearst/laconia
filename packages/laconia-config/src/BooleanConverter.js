const convertToBoolean = value => {
  const falsyValues = ["false", "null", "undefined", "0", "", "no", "off"];
  return !falsyValues.includes(value.toLowerCase().trim());
};

module.exports = class BooleanConverter {
  convertMultiple(values) {
    return Object.keys(values).reduce((acc, value) => {
      acc[value] = convertToBoolean(values[value]);
      return acc;
    }, {});
  }
};
