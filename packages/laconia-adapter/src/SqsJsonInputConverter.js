const SqsEvent = require("./SqsEvent");

module.exports = class SnsJsonInputConverter {
  convert(event) {
    return SqsEvent.fromRaw(event).records.map(r => r.body);
  }
};
