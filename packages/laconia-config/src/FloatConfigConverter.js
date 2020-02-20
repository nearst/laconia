const validateAndParseFloat = (key, val) => {
  if (val.trim() === "") {
    throw new Error(
      `Passed config:float "${key}" is empty.`
    );
  }
  const parsedVal = parseFloat(val);
  if (isNaN(val)) {
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
