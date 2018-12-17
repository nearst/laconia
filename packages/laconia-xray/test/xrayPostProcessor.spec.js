const AWS = require("aws-sdk");
const xrayPostProcessor = require("../src/xrayPostProcessor");

describe("xrayPostProcessor", () => {
  it("calls captureAWSClient on a single AWS Service", async () => {
    const instances = {
      $lambda: new AWS.Lambda()
    };
    xrayPostProcessor(instances);
    expect(instances.$lambda).toBeInstanceOf(AWS.Lambda);
    expect(instances.$lambda.customRequestHandler).toBeFunction();
  });

  it("calls captureAWSClient on multiple AWS services", async () => {
    const instances = {
      $lambda: new AWS.Lambda(),
      $s3: new AWS.S3()
    };
    xrayPostProcessor(instances);
    expect(instances.$lambda.customRequestHandler).toBeFunction();
    expect(instances.$s3.customRequestHandler).toBeFunction();
  });

  it("ignores non AWS service instance", async () => {
    const instances = {
      $lambda: "not aws service"
    };
    xrayPostProcessor(instances);
    expect(instances.$lambda).toEqual("not aws service");
  });
});
