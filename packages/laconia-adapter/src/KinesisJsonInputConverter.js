const KinesisEvent = require("./KinesisEvent");

module.exports = class KinesisJsonInputConverter {
  convert(event) {
    return KinesisEvent.fromEvent(event).jsonRecords;
  }
};
