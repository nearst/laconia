/* eslint-env jest */

const AWSMock = require("aws-sdk-mock");
const s3BatchHandler = require("../src/s3-batch-handler");
const { sharedAcceptanceTest } = require("./batch-handler-helper");

const yields = arg => (params, callback) => callback(null, arg);

describe("s3 batch handler acceptance", () => {
  let s3;

  beforeEach(() => {
    s3 = {
      getObject: jest.fn().mockImplementation(
        yields({
          Body: {
            toString: () =>
              JSON.stringify({
                music: [{ Artist: "Foo" }, { Artist: "Bar" }, { Artist: "Fiz" }]
              })
          }
        })
      )
    };
    AWSMock.mock("S3", "getObject", s3.getObject);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  sharedAcceptanceTest(() => {
    return s3BatchHandler("music", {
      Bucket: "foo",
      Key: "bar"
    });
  });

  it("allows s3 initiation to be customised");
});
