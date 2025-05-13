const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { mockClient } = require("aws-sdk-client-mock");
const createEvent = require("aws-event-mocks");
const { s3Body } = require("@laconia/test-helper");
const S3JsonInputConverter = require("../src/S3JsonInputConverter");

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

describe("S3JsonInputConverter", () => {
  const s3 = mockClient(S3Client);
  const event = createS3Event("object-key");

  beforeEach(() => {
    s3.on(GetObjectCommand).resolves({
      Body: s3Body('{"foo":"bar"}')
    });
  });

  afterEach(() => s3.reset());

  it("should convert event to json", async () => {
    const inputConverter = new S3JsonInputConverter(s3);
    const input = await inputConverter.convert(event);
    expect(input).toEqual({ foo: "bar" });
  });

  it("should call AWS sdk with the correct parameter", async () => {
    const inputConverter = new S3JsonInputConverter(s3);
    await inputConverter.convert(event);

    expect(s3).toHaveReceivedCommandWith(GetObjectCommand, {
      Bucket: "my-bucket-name",
      Key: "object-key"
    });
  });
});
