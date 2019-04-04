module.exports = class KinesisEvent {
  constructor(bufferRecords) {
    this.bufferRecords = bufferRecords;
  }

  get stringRecords() {
    return this.bufferRecords.map(r => r.toString("utf8"));
  }

  get jsonRecords() {
    return this.stringRecords.map(r => JSON.parse(r));
  }

  static fromEvent(event) {
    return new KinesisEvent(
      event.Records.map(r => Buffer.from(r.kinesis.data, "base64"))
    );
  }
};
