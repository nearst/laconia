const S3Spier = require("./S3Spier");
const NullSpier = require("./NullSpier");

const bucketEnvVarName = "LACONIA_TEST_SPY_BUCKET";

const validateBucketName = bucketName => {
  if (bucketName === undefined) {
    throw new Error(`${bucketEnvVarName} environment variable is not set`);
  }
};

module.exports = class LaconiaContextSpierFactory {
  constructor(lc) {
    this.lc = lc;
  }

  makeSpier() {
    const bucketName = this.lc.env[bucketEnvVarName];
    validateBucketName(bucketName);

    if (bucketName === null || bucketName === "null") {
      return new NullSpier();
    } else {
      const functionName = this.lc.context.functionName;
      return new S3Spier(bucketName, functionName, this.lc.$s3);
    }
  }
};
