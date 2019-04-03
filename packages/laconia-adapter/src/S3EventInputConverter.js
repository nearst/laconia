const S3Event = require("./S3Event");

module.exports = class S3EventInputConverter {
  convert(event) {
    return S3Event.fromEvent(event);
  }
};
