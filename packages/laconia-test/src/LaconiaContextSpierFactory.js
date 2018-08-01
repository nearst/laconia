const S3Spier = require("./S3Spier");
const NullSpier = require("./NullSpier");

module.exports = class LaconiaContextSpierFactory {
  constructor(lc) {
    this.lc = lc;
  }

  makeSpier() {
    const bucketName = this.lc.env.LACONIA_TEST_SPY_BUCKET;
    const functionName = this.lc.context.functionName;
    if (bucketName && bucketName !== "disabled") {
      return new S3Spier(bucketName, functionName);
    } else {
      return new NullSpier();
    }
  }
};
