const laconia = require("@laconia/core");

module.exports = inputConverter => {
  return fn => {
    return laconia((event, laconiaContext) => {
      inputConverter.convert(event);
    });
  };
};
