const { Readable } = require("stream");
const { S3Client } = require("@aws-sdk/client-s3");
const { mockClient } = require("aws-sdk-client-mock");
const createEvent = require("aws-event-mocks");
const { s3Body } = require("@laconia/test-helper");
const S3StreamInputConverter = require("../src/S3StreamInputConverter");

const createS3Event = key => {
  return createEvent({
    template: "aws:s3",
    merge: {
      Records: [
        {
          eventName: "ObjectCreated:Put",
          s3: {
            bucket: {
              name: "my-bucket-name"
            },
            object: {
              key
            }
          }
        }
      ]
    }
  });
};
exports.createS3Event = createS3Event;

describe("S3StreamInputConverter", () => {
  let s3, s3Mock;
  const event = createS3Event("object-key");

  beforeEach(() => {
    s3 = new S3Client();
    s3Mock = mockClient(s3);
    s3Mock.resolves({
      Body: s3Body({ foo: "bar" })
    });
  });

  it("should convert event to stream", async () => {
    const inputConverter = new S3StreamInputConverter(s3);
    const input = await inputConverter.convert(event);
    expect(input).toBeInstanceOf(Readable);
  });

  it("should call AWS sdk with the correct parameter", async () => {
    const inputConverter = new S3StreamInputConverter(s3);
    await inputConverter.convert(event);

    expect(s3Mock.call(0).args[0].input).toEqual({
      Bucket: "my-bucket-name",
      Key: "object-key"
    });
  });
});
