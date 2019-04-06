const { s3 } = require("@laconia/event");

module.exports = class S3EventInputConverter {
  convert(event) {
    return s3(event);
  }
};
