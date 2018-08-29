const delay = require("delay");
const AWSMock = require("aws-sdk-mock");
const S3Spier = require("../src/S3Spier");
const { yields } = require("@laconia/test-helper");
const _ = require("lodash");

describe("S3Spier", () => {
  let lc;
  let s3;

  beforeEach(() => {
    lc = {
      event: { foo: "bar" },
      context: { functionName: "function name" }
    };

    s3 = {
      putObject: jest.fn().mockImplementation(yields()),
      getObject: jest.fn().mockImplementation(
        yields({
          Body: JSON.stringify({})
        })
      ),
      deleteObject: jest.fn().mockImplementation(yields()),
      listObjects: jest.fn().mockImplementation(
        yields({
          Contents: []
        })
      )
    };

    AWSMock.mock("S3", "deleteObject", s3.deleteObject);
    AWSMock.mock("S3", "listObjects", s3.listObjects);
    AWSMock.mock("S3", "putObject", s3.putObject);
    AWSMock.mock("S3", "getObject", s3.getObject);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  const sharedListObjectsTest = operation => {
    it("should only retrieve objects related to the function name", async () => {
      const spier = new S3Spier("bucket name", "function name");
      await operation(spier);
      expect(s3.listObjects).toBeCalledWith(
        expect.objectContaining({
          Bucket: "bucket name",
          Prefix: "function name"
        }),
        expect.any(Function)
      );
    });
  };

  const sharedMultiOperationTest = (operation, s3method) => {
    it("should only retrieve objects related to the function name", async () => {
      const spier = new S3Spier("bucket name", "function name");
      await operation(spier);
      expect(s3.listObjects).toBeCalledWith(
        expect.objectContaining({
          Bucket: "bucket name",
          Prefix: "function name"
        }),
        expect.any(Function)
      );
    });

    it("should operate on all objects returned", async () => {
      const keys = ["1", "2"];
      s3.listObjects.mockImplementation(
        yields({
          Contents: keys.map(k => ({ Key: k }))
        })
      );
      const spier = new S3Spier("bucket name", "function name");
      await operation(spier);
      expect(s3method()).toHaveBeenCalledTimes(keys.length);
      keys.forEach(k => {
        expect(s3method()).toBeCalledWith(
          expect.objectContaining({
            Bucket: "bucket name",
            Key: k
          }),
          expect.any(Function)
        );
      });
    });
  };

  describe("#track", () => {
    it("should call s3 with the configured bucket name", async () => {
      const spier = new S3Spier("bucket name", "function name");
      await spier.track(lc);
      expect(s3.putObject).toBeCalledWith(
        expect.objectContaining({ Bucket: "bucket name" }),
        expect.any(Function)
      );
    });

    it("should generate unique bucket item name", async () => {
      const spier = new S3Spier("bucket name", "function name");
      await spier.track(_.merge(lc, { context: { awsRequestId: "123" } }));
      await spier.track(_.merge(lc, { context: { awsRequestId: "456" } }));

      const keys = s3.putObject.mock.calls.map(c => c[0].Key);
      expect(keys).toHaveLength(2);
      keys.forEach(k => {
        expect(k).toStartWith("function name/");
      });
      expect(keys[0]).not.toEqual(keys[1]);
    });

    it("should track event object", async () => {
      const spier = new S3Spier("bucket name", "function name");
      await spier.track(lc);
      expect(s3.putObject).toBeCalledWith(
        expect.objectContaining({ Body: expect.any(String) }),
        expect.any(Function)
      );

      const body = JSON.parse(s3.putObject.mock.calls[0][0].Body);
      expect(body).toEqual({ event: { foo: "bar" } });
    });

    it("should make sure the object stored in S3 openable easily in a browser and an edito", async () => {
      const spier = new S3Spier("bucket name", "function name");
      await spier.track(lc);
      expect(s3.putObject).toBeCalledWith(
        expect.objectContaining({
          Key: expect.stringMatching(/.json$/),
          ContentType: "application/json"
        }),
        expect.any(Function)
      );
    });
  });

  describe("#clear", () => {
    sharedListObjectsTest(spier => spier.clear());
    sharedMultiOperationTest(spier => spier.clear(), () => s3.deleteObject);
  });

  describe("#getInvocations", () => {
    sharedListObjectsTest(spier => spier.getInvocations());
    sharedMultiOperationTest(
      spier => spier.getInvocations(),
      () => s3.getObject
    );
  });

  describe("#waitForTotalInvocations", () => {
    sharedListObjectsTest(spier => spier.waitForTotalInvocations(0));

    it(
      "should wait for total invocations",
      async () => {
        const spier = new S3Spier("bucket name", "function name");
        await Promise.all([
          spier.waitForTotalInvocations(2),
          delay(25).then(_ => {
            s3.listObjects.mockImplementation(
              yields({
                Contents: [{ Key: "key" }, { Key: "key2" }]
              })
            );
          })
        ]);
      },
      200
    );
  });
});
