const { sns } = require("@laconia/event");

module.exports = class SnsJsonInputConverter {
  convert(event) {
    return sns(event).message;
  }
};
