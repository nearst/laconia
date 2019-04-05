module.exports = class KinesisRecord {
  constructor(data) {
    this.data = data;
  }

  get textData() {
    return this.data.toString("utf8");
  }

  get jsonData() {
    return JSON.parse(this.textData);
  }

  static fromRaw(record) {
    return new KinesisRecord(Buffer.from(record.kinesis.data, "base64"));
  }
};
