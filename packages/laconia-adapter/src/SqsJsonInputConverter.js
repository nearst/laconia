const { sqs } = require("@laconia/event");

module.exports = class SnsJsonInputConverter {
  convert(event) {
    return sqs(event).records.map(r => r.body);
  }
};
