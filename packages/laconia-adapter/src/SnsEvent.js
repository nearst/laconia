const tryParseJson = object => {
  try {
    return JSON.parse(object);
  } catch (ignored) {
    return object;
  }
};

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
