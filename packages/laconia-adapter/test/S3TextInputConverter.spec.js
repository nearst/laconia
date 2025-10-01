const { S3Client } = require("@aws-sdk/client-s3");
const { mockClient } = require("aws-sdk-client-mock");
const createEvent = require("aws-event-mocks");
const { s3Body } = require("@laconia/test-helper");
const S3TextInputConverter = require("../src/S3TextInputConverter");

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

describe("S3TextInputConverter", () => {
  let s3, s3Mock;
  const event = createS3Event("object-key");

  beforeEach(() => {
    s3 = new S3Client();
    s3Mock = mockClient(s3);
    s3Mock.resolves({
      Body: s3Body({ foo: "bar" })
    });
  });

  it("should convert event to text", async () => {
    const inputConverter = new S3TextInputConverter(s3);
    const input = await inputConverter.convert(event);

    expect(input).toEqual('{"foo":"bar"}');
  });
});
