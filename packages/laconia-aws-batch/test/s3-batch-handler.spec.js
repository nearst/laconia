/* eslint-env jest */

const AWSMock = require("aws-sdk-mock");
const s3BatchHandler = require("../src/s3-batch-handler");
const { sharedBehaviour } = require("./shared-batch-handler-spec");
const { s3Body } = require("laconia-test-helper");

describe("s3 batch handler", () => {
  let s3;

  beforeEach(() => {
    s3 = {
      getObject: jest.fn().mockImplementation(
        s3Body({
          music: [{ Artist: "Foo" }, { Artist: "Bar" }, { Artist: "Fiz" }]
        })
      )
    };
    AWSMock.mock("S3", "getObject", s3.getObject);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  sharedBehaviour(options => {
    return s3BatchHandler("music", {
      Bucket: "foo",
      Key: "bar"
    });
  });
});
