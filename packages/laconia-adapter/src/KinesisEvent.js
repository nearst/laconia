const KinesisRecord = require("./KinesisRecord");

module.exports = class KinesisEvent {
  constructor(records) {
    this.records = records;
  }

  static fromEvent(event) {
    return new KinesisEvent(event.Records.map(r => KinesisRecord.fromRaw(r)));
  }
};
