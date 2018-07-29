const S3Spyer = require("./S3Spyer");
const NullSpyer = require("./NullSpyer");

module.exports = class LaconiaContextSpyerFactory {
  constructor(lc) {
    this.lc = lc;
  }

  makeSpy() {
    const bucketName = this.lc.env.LACONIA_TEST_SPY_BUCKET_NAME;
    if (bucketName && bucketName !== "disabled") {
      return new S3Spyer(bucketName);
    } else {
      return new NullSpyer();
    }
  }
};
