const EventAdapter = require("./EventAdapter");

module.exports = class S3EventAdapter extends EventAdapter {
  async handle(event, laconiaContext) {
    this.inputConverter.s3 = laconiaContext.$s3;
    return super.handle(event, laconiaContext);
  }
};
