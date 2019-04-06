const { kinesis } = require("@laconia/event");

module.exports = class KinesisJsonInputConverter {
  convert(event) {
    return kinesis(event).records.map(r => r.jsonData);
  }
};
