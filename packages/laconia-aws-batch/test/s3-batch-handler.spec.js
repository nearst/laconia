/* eslint-env jest */

const AWSMock = require("aws-sdk-mock");
const s3BatchHandler = require("../src/s3-batch-handler");

const yields = arg => (params, callback) => callback(null, arg);

describe("s3 batch handler", () => {
  let lambda, s3, itemListener, event, context, callback;

  beforeEach(() => {
    lambda = { invoke: jest.fn() };
    s3 = {
      getObject: jest.fn().mockImplementation(
        yields({
          Body: {
            toString: () =>
              JSON.stringify({
                database: {
                  music: {
                    list: [
                      { Artist: "Foo" },
                      { Artist: "Bar" },
                      { Artist: "Fiz" }
                    ]
                  }
                }
              })
          }
        })
      )
    };
    AWSMock.mock("Lambda", "invoke", lambda.invoke);
    AWSMock.mock("S3", "getObject", s3.getObject);

    itemListener = jest.fn();
    event = {};
    context = { functionName: "blah", getRemainingTimeInMillis: () => 100000 };
    callback = jest.fn();
  });

  afterEach(() => {
    AWSMock.restore();
  });

  describe("when finish processing in a single lambda execution", () => {
    beforeEach(async () => {
      await s3BatchHandler("database['music'].list", {
        Bucket: "foo",
        Key: "bar"
      }).on("item", itemListener)(event, context, callback);
    });
    it("should process all items", () => {
      expect(itemListener).toHaveBeenCalledTimes(3);
      expect(itemListener).toHaveBeenCalledWith({ Artist: "Foo" });
      expect(itemListener).toHaveBeenCalledWith({ Artist: "Bar" });
      expect(itemListener).toHaveBeenCalledWith({ Artist: "Fiz" });
    });
    it("should notify listeners on lifecycle events");
    it("should not recurse");
  });

  describe("when time is up", () => {
    it("should stop processing when time is up");
    it("should notify listeners on lifecycle events");
    it("should recurse when time is up");
  });

  describe("when completing recursion", () => {
    it("should process all items");
  });

  it("allows s3 initiation to be customised");
});
