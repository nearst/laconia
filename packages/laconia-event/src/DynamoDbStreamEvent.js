const DynamoDbStreamRecord = require("./DynamoDbStreamRecord");

module.exports = class DynamoDbStreamEvent {
  constructor(records) {
    this.records = records;
  }

  static fromRaw(event) {
    return new DynamoDbStreamEvent(
      event.Records.map(r => DynamoDbStreamRecord.fromRaw(r))
    );
  }
};
