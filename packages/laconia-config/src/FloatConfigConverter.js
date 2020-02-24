const floatRegex = /[^0-9.]/g;

const validateAndParseFloat = (key, val) => {
  const parsedVal = parseFloat(val);
  if (isNaN(parsedVal) || val !== val.replace(floatRegex, "")) {
    throw new Error(
      `Passed config:float "${key}" = "${val}" is not a valid float.`
    );
  }

  return parsedVal;
};

module.exports = class FloatConfigConverter {
  convertMultiple(values) {
    return Object.keys(values).reduce((acc, key) => {
      acc[key] = validateAndParseFloat(key, values[key]);
      return acc;
    }, {});
  }
};
