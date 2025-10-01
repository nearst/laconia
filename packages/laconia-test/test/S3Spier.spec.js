const delay = require("delay");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand
} = require("@aws-sdk/client-s3");
const { mockClient } = require("aws-sdk-client-mock");
const S3Spier = require("../src/S3Spier");
const _ = require("lodash");

describe("S3Spier", () => {
  const s3 = new S3Client();
  const s3Mock = mockClient(s3);
  let lc;

  beforeEach(() => {
    s3Mock.reset();

    lc = {
      event: { foo: "bar" },
      context: { functionName: "function name" }
    };

    s3Mock.on(PutObjectCommand).resolves({});
    s3Mock.on(GetObjectCommand).resolves({
      Body: {
        transformToString: () => Promise.resolve(JSON.stringify({}))
      }
    });
    s3Mock.on(DeleteObjectCommand).resolves({});
    s3Mock.on(ListObjectsCommand).resolves({
      Contents: []
    });
  });

  const sharedListObjectsTest = operation => {
    it("should only retrieve objects related to the function name", async () => {
      const spier = new S3Spier("bucket name", "function name");
      spier.s3 = s3;
      await operation(spier);

      expect(s3Mock).toHaveReceivedCommandWith(ListObjectsCommand, {
        Bucket: "bucket name",
        Prefix: "function name"
      });
    });
  };

  const sharedMultiOperationTest = (operation, s3Command) => {
    it("should only retrieve objects related to the function name", async () => {
      const spier = new S3Spier("bucket name", "function name");
      spier.s3 = s3;
      await operation(spier);

      expect(s3Mock).toHaveReceivedCommandWith(ListObjectsCommand, {
        Bucket: "bucket name",
        Prefix: "function name"
      });
    });

    it("should operate on all objects returned", async () => {
      const keys = ["1", "2"];
      s3Mock.on(ListObjectsCommand).resolves({
        Contents: keys.map(k => ({ Key: k }))
      });
      const spier = new S3Spier("bucket name", "function name");
      spier.s3 = s3;
      await operation(spier);
      expect(s3Mock).toHaveReceivedCommandTimes(s3Command, keys.length);
      keys.forEach(k => {
        expect(s3Mock).toHaveReceivedCommandWith(s3Command, {
          Bucket: "bucket name",
          Key: k
        });
      });
    });
  };

  describe("#track", () => {
    it("should call s3 with the correct bucket and event config", async () => {
      const spier = new S3Spier("bucket name", "function name");
      spier.s3 = s3;
      await spier.track(lc);

      expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: "bucket name",
        Key: expect.stringMatching(/function name\/\d+-\w+\.json/),
        Body: JSON.stringify({ event: { foo: "bar" } }),
        ContentType: "application/json"
      });
    });

    it("should generate unique bucket item name", async () => {
      const spier = new S3Spier("bucket name", "function name");
      spier.s3 = s3;
      await spier.track(_.merge(lc, { context: { awsRequestId: "123" } }));
      await spier.track(_.merge(lc, { context: { awsRequestId: "456" } }));

      const keys = s3Mock
        .commandCalls(PutObjectCommand)
        .map(call => call.args[0].input.Key);

      expect(keys).toHaveLength(2);
      keys.forEach(k => {
        expect(k).toStartWith("function name/");
      });
      expect(keys[0]).not.toEqual(keys[1]);
    });
  });

  describe("#clear", () => {
    sharedListObjectsTest(spier => spier.clear());
    sharedMultiOperationTest(spier => spier.clear(), DeleteObjectCommand);
  });

  describe("#getInvocations", () => {
    sharedListObjectsTest(spier => spier.getInvocations());
    sharedMultiOperationTest(spier => spier.getInvocations(), GetObjectCommand);
  });

  describe("#waitForTotalInvocations", () => {
    sharedListObjectsTest(spier => spier.waitForTotalInvocations(0));

    it("should wait for total invocations", async () => {
      const spier = new S3Spier("bucket name", "function name");
      spier.s3 = s3;
      await Promise.all([
        spier.waitForTotalInvocations(2),
        delay(25).then(_ => {
          s3Mock.on(ListObjectsCommand).resolves({
            Contents: [{ Key: "key" }, { Key: "key2" }]
          });
        })
      ]);
    });
  });
});
