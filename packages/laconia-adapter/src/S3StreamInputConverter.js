const { s3 } = require("@laconia/event");

module.exports = class S3StreamInputConverter {
  constructor(s3) {
    this.s3 = s3;
  }

  convert(event) {
    const s3Event = s3(event, this.s3);
    return s3Event.getStream();
  }
};
