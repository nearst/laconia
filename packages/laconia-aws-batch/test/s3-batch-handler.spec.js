/* eslint-env jest */

const AWSMock = require("aws-sdk-mock");

const { s3BatchHandler } = require("../src/s3-batch-handler");

describe("s3 batch handler", () => {
  let lambda, s3, itemListener, event, context, callback;

  beforeEach(() => {
    lambda = { invoke: jest.fn() };
    s3 = { getObject: jest.fn() };
    AWSMock.mock("Lambda", "invoke", lambda.invoke);
    AWSMock.mock("S3", "getObject", s3.getObject);

    itemListener = jest.fn();
    event = {};
    context = { functionName: "blah", getRemainingTimeInMillis: () => 100000 };
    callback = jest.fn();
  });

  describe("when finish processing in a single lambda execution", () => {
    beforeEach(async () => {
      await s3BatchHandler("data['music'].list").on("item", itemListener)(
        event,
        context,
        callback
      );
    });
    xit("should process all items", () => {
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

  it("allows s3 object to be customised");
});
