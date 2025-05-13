const { mockClient } = require("aws-sdk-client-mock");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require("stream");
const laconiaBatch = require("../src/laconiaBatch");
const s3 = require("../src/s3");
const { sharedBehaviour } = require("./shared-batch-handler-spec");

const createMockS3Response = object => {
  const jsonString = JSON.stringify(object);
  const stream = new Readable();
  stream.push(jsonString);
  stream.push(null); // End the stream

  return {
    Body: {
      transformToString: () => Promise.resolve(jsonString)
    }
  };
};

describe("s3 batch handler", () => {
  let s3Mock;

  beforeEach(() => {
    s3Mock = mockClient(S3Client);

    s3Mock.on(GetObjectCommand).resolves(
      createMockS3Response({
        music: [{ Artist: "Foo" }, { Artist: "Bar" }, { Artist: "Fiz" }]
      })
    );
  });

  afterEach(() => {
    s3Mock.reset();
  });

  sharedBehaviour(batchOptions => {
    return laconiaBatch(
      _ =>
        s3({
          path: "music",
          s3Params: {
            Bucket: "foo",
            Key: "bar"
          }
        }),
      batchOptions
    );
  });
});
