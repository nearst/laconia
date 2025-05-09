const { Readable } = require("stream");
const createEvent = require("aws-event-mocks");
const { mockClient } = require("aws-sdk-client-mock");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { sdkStreamMixin } = require("@smithy/util-stream");

const S3Event = require("../src/S3Event");

const s3Body = value => {
  const stream = new Readable();
  stream.push(value);
  stream.push(null); // end of stream
  return sdkStreamMixin(stream);
};

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
    const s3 = mockClient(S3Client);
    let event;

    beforeEach(() => {
      s3.on(GetObjectCommand).resolves({
        Body: s3Body('{"foo":"bar"}')
      });
      event = createS3Event("object-key");
    });

    afterEach(() => s3.resolves({}));

    describe("#getJson", () => {
      it("should parse returned object to json", async () => {
        const s3Event = S3Event.fromRaw(event, s3);
        const json = await s3Event.getJson();
        expect(json).toEqual({ foo: "bar" });
      });

      it("should call AWS sdk with the correct parameter", async () => {
        const s3Event = S3Event.fromRaw(event, s3);
        await s3Event.getJson();

        expect(s3).toHaveReceivedCommandWith(GetObjectCommand, {
          Bucket: "my-bucket-name",
          Key: "object-key"
        });
      });
    });

    describe("#getBuffer", () => {
      it("should retrieve buffer from S3", async () => {
        const s3Event = S3Event.fromRaw(event, s3);
        const object = await s3Event.getBuffer();
        expect(object).toHaveProperty("toString");
      });

      it("should call AWS sdk with the correct parameter", async () => {
        const s3Event = S3Event.fromRaw(event, s3);
        await s3Event.getBuffer();

        expect(s3).toHaveReceivedCommandWith(GetObjectCommand, {
          Bucket: "my-bucket-name",
          Key: "object-key"
        });
      });
    });

    describe("#getStream", () => {
      it("should convert event to stream", async () => {
        const s3Event = S3Event.fromRaw(event, s3);
        const stream = await s3Event.getStream();
        expect(stream).toBeInstanceOf(Readable);
      });

      it("should call AWS sdk with the correct parameter", async () => {
        const s3Event = S3Event.fromRaw(event, s3);
        await s3Event.getStream();

        expect(s3).toHaveReceivedCommandWith(GetObjectCommand, {
          Bucket: "my-bucket-name",
          Key: "object-key"
        });
      });
    });
    describe("#getText", () => {
      it("should convert event to Text", async () => {
        const s3Event = S3Event.fromRaw(event, s3);
        const text = await s3Event.getText();
        expect(text).toBe('{"foo":"bar"}');
      });

      it("should call AWS sdk with the correct parameter", async () => {
        const s3Event = S3Event.fromRaw(event, s3);
        await s3Event.getText();

        expect(s3).toHaveReceivedCommandWith(GetObjectCommand, {
          Bucket: "my-bucket-name",
          Key: "object-key"
        });
      });
    });
  });
});
