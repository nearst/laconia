const S3EventInputConverter = require("./S3EventInputConverter");

module.exports = class S3JsonInputConverter extends S3EventInputConverter {
  constructor(s3) {
    super(s3);
    this.s3 = s3;
  }

  async convert(event) {
    const s3Event = super.convert(event);
    const object = await this.s3.getObject(s3Event.toParams()).promise();
    return JSON.parse(object.Body.toString());
  }
};
