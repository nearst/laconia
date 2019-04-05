const SnsEvent = require("./SnsEvent");
module.exports = class SnsJsonInputConverter {
  convert(event) {
    return SnsEvent.fromRaw(event).message;
  }
};
