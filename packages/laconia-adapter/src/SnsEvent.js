const tryParseJson = object => {
  try {
    return JSON.parse(object);
  } catch (ignored) {
    return object;
  }
};

module.exports = class SnsEvent {
  constructor(message) {
    this.message = message;
  }

  static fromRaw(event) {
    return new SnsEvent(tryParseJson(event.Records[0].Sns.Message));
  }
};
