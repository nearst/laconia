const tryParseJson = require("./tryParseJson");

module.exports = class SnsEvent {
  constructor(subject, message) {
    this.subject = subject;
    this.message = message;
  }

  static fromRaw(event) {
    const record = event.Records[0].Sns;
    return new SnsEvent(record.Subject, tryParseJson(record.Message));
  }
};
