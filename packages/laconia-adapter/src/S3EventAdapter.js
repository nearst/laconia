const EventAdapter = require("./EventAdapter");

module.exports = class S3EventAdapter extends EventAdapter {
  async handle(event, laconiaContext) {
    return super.handle(event, laconiaContext);
  }
};
