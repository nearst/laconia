const AWS = require("aws-sdk");
const xrayPostProcessor = require("../src/xrayPostProcessor");

describe("xrayPostProcessor", () => {
  it("calls captureAWSClient on a single AWS Service", async () => {
    const lc = {
      $lambda: new AWS.Lambda()
    };
    xrayPostProcessor(lc);
    expect(lc.$lambda).toBeInstanceOf(AWS.Lambda);
    expect(lc.$lambda.customRequestHandler).toBeFunction();
  });

  it("calls captureAWSClient on multiple AWS services", async () => {
    const lc = {
      $lambda: new AWS.Lambda(),
      $s3: new AWS.S3()
    };
    xrayPostProcessor(lc);
    expect(lc.$lambda.customRequestHandler).toBeFunction();
    expect(lc.$s3.customRequestHandler).toBeFunction();
  });

  it("ignores non AWS service instance", async () => {
    const lc = {
      $lambda: "not aws service"
    };
    xrayPostProcessor(lc);
    expect(lc.$lambda).toEqual("not aws service");
  });
});
