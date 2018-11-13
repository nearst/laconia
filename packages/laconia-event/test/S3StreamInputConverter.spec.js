const { Readable } = require("stream");
const AWS = require("aws-sdk");
const AWSMock = require("aws-sdk-mock");
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

describe("S3StreamInputConverter", () => {
  let s3;
  const event = createS3Event("object-key");

  beforeEach(() => {
    s3 = {
      getObject: jest.fn().mockImplementation(s3Body({ foo: "bar" }))
    };
    AWSMock.mock("S3", "getObject", s3.getObject);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it("should retrieve key", () => {
    const inputConverter = new S3StreamInputConverter(new AWS.S3());
    const input = inputConverter.convert(event);
    expect(input).toBeInstanceOf(Readable);
  });

  it("should call AWS sdk with the correct parameter", async () => {
    const inputConverter = new S3StreamInputConverter(new AWS.S3());
    inputConverter.convert(event);

    expect(s3.getObject).toBeCalledWith(
      {
        Bucket: "my-bucket-name",
        Key: "object-key"
      },
      expect.any(Function)
    );
  });
});
