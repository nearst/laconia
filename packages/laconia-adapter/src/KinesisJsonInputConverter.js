const KinesisEvent = require("./KinesisEvent");

module.exports = class KinesisJsonInputConverter {
  convert(event) {
    return KinesisEvent.fromRaw(event).records.map(r => r.jsonData);
  }
};
