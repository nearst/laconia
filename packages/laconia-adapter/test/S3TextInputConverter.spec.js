const AWS = require("aws-sdk");
const AWSMock = require("aws-sdk-mock");
const createEvent = require("aws-event-mocks");
const { s3Body } = require("@laconia/test-helper");
const S3TextInputConverter = require("../src/S3TextInputConverter");

AWSMock.setSDKInstance(AWS);

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

  it("should convert event to json", async () => {
    const inputConverter = new S3TextInputConverter(new AWS.S3());
    const input = await inputConverter.convert(event);

    expect(input).toEqual('{"foo":"bar"}');
  });

  it("should call AWS sdk with the correct parameter", async () => {
    const inputConverter = new S3TextInputConverter(new AWS.S3());
    await inputConverter.convert(event);

    expect(s3.getObject).toBeCalledWith(
      {
        Bucket: "my-bucket-name",
        Key: "object-key"
      },
      expect.any(Function)
    );
  });
});
