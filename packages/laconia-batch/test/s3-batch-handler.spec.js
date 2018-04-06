const AWSMock = require("aws-sdk-mock");
const laconiaBatch = require("../src/laconiaBatch");
const s3 = require("../src/s3");
const { sharedBehaviour } = require("./shared-batch-handler-spec");
const { s3Body } = require("laconia-test-helper");

describe("s3 batch handler", () => {
  beforeEach(() => {
    const awsS3 = {
      getObject: jest.fn().mockImplementation(
        s3Body({
          music: [{ Artist: "Foo" }, { Artist: "Bar" }, { Artist: "Fiz" }]
        })
      )
    };
    AWSMock.mock("S3", "getObject", awsS3.getObject);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  sharedBehaviour(batchOptions => {
    return laconiaBatch(
      _ =>
        s3({
          path: "music",
          s3Params: {
            Bucket: "foo",
            Key: "bar"
          }
        }),
      batchOptions
    );
  });
});
