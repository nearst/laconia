const { yields } = require("laconia-test-helper");
const recursiveHandler = require("../src/recursive-handler");
const AWSMock = require("aws-sdk-mock");

expect.extend({
  toBeCalledWithPayload(received, expected) {
    expect(received).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(received.mock.calls[0][0].Payload);
    expect(payload).toEqual(expected);
    return { pass: true };
  }
});

describe("recursive handler", () => {
  let context, callback, invokeMock;

  beforeEach(() => {
    callback = jest.fn();
    context = { functionName: "foo" };
    invokeMock = jest.fn().mockImplementation(yields({ StatusCode: 202 }));
    AWSMock.mock("Lambda", "invoke", invokeMock);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it("should call Lambda callback with null when there is no value returned", async () => {
    await recursiveHandler(() => {})({}, {}, callback);
    expect(callback).toBeCalledWith(null, undefined);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should delegate AWS parameters to handler function", async () => {
    const handler = jest.fn();
    await recursiveHandler(handler)(
      { foo: "event" },
      { fiz: "context" },
      callback
    );
    expect(handler).toBeCalledWith(
      { event: { foo: "event" }, context: { fiz: "context" } },
      expect.any(Function)
    );
  });

  it("recurses when the recurse callback is called", async () => {
    await recursiveHandler((_, recurse) => recurse())({}, context, callback);

    expect(invokeMock).toBeCalledWith(
      expect.objectContaining({
        FunctionName: "foo",
        InvocationType: "Event"
      }),
      expect.any(Function)
    );
  });

  it("throws error when lambda recursion failed", async () => {
    const error = new Error("boom");
    invokeMock.mockImplementation(() => {
      throw error;
    });
    await recursiveHandler((_, recurse) => recurse())({}, context, callback);
    expect(callback).toBeCalledWith(error);
  });

  it("throws error when payload given is not an object", async () => {
    await recursiveHandler((_, recurse) => recurse("non object"))(
      {},
      context,
      callback
    );
    expect(callback).toBeCalledWith(expect.any(Error));
    expect(callback).toBeCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Payload must be an object")
      })
    );
  });

  it("should merge recurse payload and event object", async () => {
    await recursiveHandler((_, recurse) => {
      recurse({ cursor: { index: 0, lastEvaluatedKey: "bar" } });
    })({ key1: "1", key2: "2" }, context, callback);

    expect(invokeMock).toBeCalledWithPayload({
      key1: "1",
      key2: "2",
      cursor: { index: 0, lastEvaluatedKey: "bar" }
    });
  });

  it("should be able to not call recurse function", async () => {
    await recursiveHandler(() => {})({}, context, callback);

    expect(invokeMock).not.toHaveBeenCalled();
  });
});
