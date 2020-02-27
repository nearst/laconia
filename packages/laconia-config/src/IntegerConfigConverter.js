const integerRegex = /[^0-9-]/g;

const validateAndParseInt = (key, val) => {
  const parsedVal = parseInt(val, 10);
  if (isNaN(parsedVal) || val.match(integerRegex)) {
    throw new Error(
      `Passed config:integer "${key}" = "${val}" is not a valid integer.`
    );
  }

  return parsedVal;
};

module.exports = class IntegerConfigConverter {
  convertMultiple(values) {
    return Object.keys(values).reduce((acc, key) => {
      acc[key] = validateAndParseInt(key, values[key]);
      return acc;
    }, {});
  }
};
