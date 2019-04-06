const SqsRecord = require("./SqsRecord");

module.exports = class SqsEvent {
  constructor(records) {
    this.records = records;
  }

  static fromRaw(event) {
    return new SqsEvent(event.Records.map(r => SqsRecord.fromRaw(r)));
  }
};
