const tryParseJson = object => {
  try {
    return JSON.parse(object);
  } catch (ignored) {
    return object;
  }
};

module.exports = class SqsRecord {
  constructor(body) {
    this.body = body;
  }

  static fromRaw(record) {
    const sqsRecord = new SqsRecord(tryParseJson(record.body));
    sqsRecord.receiptHandle = record.receiptHandle;
    return sqsRecord;
  }
};
