const AWS = require("aws-sdk");
const { S3, S3Client } = require("@aws-sdk/client-s3");
const xrayPostProcessor = require("../src/xrayPostProcessor");

describe("xrayPostProcessor", () => {
  it("calls captureAWSClient on AWS v2 services", async () => {
    const instances = {
      $lambda: new AWS.Lambda(),
      $s3: new AWS.S3()
    };
    xrayPostProcessor(instances);
    expect(instances.$lambda.customRequestHandler).toBeFunction();
    expect(instances.$s3.customRequestHandler).toBeFunction();
  });

  it("calls captureAWSv3Client on AWS v3 services", async () => {
    const instances = {
      $s3: new S3Client(),
      s3Instance: new S3()
    };
    xrayPostProcessor(instances);
    expect(instances.$s3.middlewareStack.add).toBeFunction();
    expect(instances.s3Instance.middlewareStack.add).toBeFunction();
  });

  it("ignores non AWS service instance", async () => {
    const instances = {
      $lambda: "not aws service"
    };
    xrayPostProcessor(instances);
    expect(instances.$lambda).toEqual("not aws service");
  });
});
