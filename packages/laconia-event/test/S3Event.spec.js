const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const S3Event = require("../src/S3Event");
const { s3Body } = require("@laconia/test-helper");

describe("S3Event", () => {
  let s3;

  beforeEach(() => {
    s3 = {
      getObject: jest.fn().mockImplementation(s3Body({ foo: "bar" }))
    };
    AWSMock.mock("S3", "getObject", s3.getObject);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it("should call AWS sdk with the correct parameter", async () => {
    const s3Event = new S3Event(new AWS.S3(), "bucket name", "key name");
    await s3Event.getObject();

    expect(s3.getObject).toBeCalledWith(
      {
        Bucket: "bucket name",
        Key: "key name"
      },
      expect.any(Function)
    );
  });

  it("should be able to retrieve json object", async () => {
    const s3Event = new S3Event(new AWS.S3(), "bucket name", "key name");
    const json = await s3Event.getJson();

    expect(json).toEqual({ foo: "bar" });
  });
});
