const S3InputConverter = require("../src/S3InputConverter");
const createEvent = require("aws-event-mocks");

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

describe("S3InputConverter", () => {
  it("should retrieve key", () => {
    const event = createS3Event("object-key");
    const inputConverter = new S3InputConverter();
    const input = inputConverter.convert(event);

    expect(input).toHaveProperty("key", "object-key");
  });

  it("should url decode key", () => {
    const event = createS3Event("file+with+spaces.txt");
    const inputConverter = new S3InputConverter();
    const input = inputConverter.convert(event);

    expect(input).toHaveProperty("key", "file with spaces.txt");
  });

  it("should url decode unicode key", () => {
    const event = createS3Event("%E2%9C%93");
    const inputConverter = new S3InputConverter();
    const input = inputConverter.convert(event);

    expect(input).toHaveProperty("key", "\u2713");
  });

  it("should retrieve bucket name", () => {
    const event = createS3Event("%E2%9C%93");
    const inputConverter = new S3InputConverter();
    const input = inputConverter.convert(event);

    expect(input).toHaveProperty("bucket", "my-bucket-name");
  });
});
