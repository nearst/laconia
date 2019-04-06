const { s3 } = require("@laconia/event");

module.exports = class S3JsonInputConverter {
  constructor(s3) {
    this.s3 = s3;
  }

  async convert(event) {
    const s3Event = s3(event);
    return s3Event.getJson(this.s3);
  }
};
