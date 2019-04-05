const AWS = require("aws-sdk");
const AWSMock = require("aws-sdk-mock");
const createEvent = require("aws-event-mocks");
const { Readable } = require("stream");
const { s3Body } = require("@laconia/test-helper");
const S3Event = require("../src/S3Event");

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

describe("S3Event", () => {
  describe("#fromRaw", () => {
    it("should retrieve key", () => {
      const event = createS3Event("object-key");
      const s3Event = S3Event.fromRaw(event);

      expect(s3Event).toHaveProperty("key", "object-key");
    });

    it("should url decode key", () => {
      const event = createS3Event("file+with+spaces.txt");
      const s3Event = S3Event.fromRaw(event);

      expect(s3Event).toHaveProperty("key", "file with spaces.txt");
    });

    it("should url decode unicode key", () => {
      const event = createS3Event("%E2%9C%93");
      const s3Event = S3Event.fromRaw(event);

      expect(s3Event).toHaveProperty("key", "\u2713");
    });

    it("should retrieve bucket name", () => {
      const event = createS3Event("%E2%9C%93");
      const s3Event = S3Event.fromRaw(event);

      expect(s3Event).toHaveProperty("bucket", "my-bucket-name");
    });
  });

  describe("when hitting S3", () => {
    let s3;
    let event;

    beforeEach(() => {
      s3 = {
        getObject: jest.fn().mockImplementation(s3Body({ foo: "bar" }))
      };
      AWSMock.mock("S3", "getObject", s3.getObject);

      event = createS3Event("object-key");
    });

    afterEach(() => {
      AWSMock.restore();
    });

    describe("#getJson", () => {
      it("should parse returned object to json", async () => {
        const s3Event = S3Event.fromRaw(event);
        const json = await s3Event.getJson(new AWS.S3());
        expect(json).toEqual({ foo: "bar" });
      });

      it("should call AWS sdk with the correct parameter", async () => {
        const s3Event = S3Event.fromRaw(event);
        await s3Event.getJson(new AWS.S3());

        expect(s3.getObject).toBeCalledWith(
          {
            Bucket: "my-bucket-name",
            Key: "object-key"
          },
          expect.any(Function)
        );
      });
    });

    describe("#getObject", () => {
      it("should retrieve object from S3", async () => {
        const s3Event = S3Event.fromRaw(event);
        const object = await s3Event.getObject(new AWS.S3());
        expect(object).toHaveProperty("toString");
      });

      it("should call AWS sdk with the correct parameter", async () => {
        const s3Event = S3Event.fromRaw(event);
        await s3Event.getObject(new AWS.S3());

        expect(s3.getObject).toBeCalledWith(
          {
            Bucket: "my-bucket-name",
            Key: "object-key"
          },
          expect.any(Function)
        );
      });
    });

    describe("#getStream", () => {
      it("should convert event to stream", () => {
        const s3Event = S3Event.fromRaw(event);
        const stream = s3Event.getStream(new AWS.S3());
        expect(stream).toBeInstanceOf(Readable);
      });

      it("should call AWS sdk with the correct parameter", async () => {
        const s3Event = S3Event.fromRaw(event);
        s3Event.getStream(new AWS.S3());

        expect(s3.getObject).toBeCalledWith(
          {
            Bucket: "my-bucket-name",
            Key: "object-key"
          },
          expect.any(Function)
        );
      });
    });
  });
});
