const S3Spier = require("./S3Spier");
const NullSpier = require("./NullSpier");

module.exports = class LaconiaContextSpierFactory {
  constructor(lc) {
    this.lc = lc;
  }

  makeSpy() {
    const bucketName = this.lc.env.LACONIA_TEST_SPY_BUCKET_NAME;
    if (bucketName && bucketName !== "disabled") {
      return new S3Spier(bucketName);
    } else {
      return new NullSpier();
    }
  }
};
