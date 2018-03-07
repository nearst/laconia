/* eslint-env jest */

const recursiveHandler = require("../src/recursive-handler");
const AWSMock = require("aws-sdk-mock");

describe("recursive handler", () => {
  let context, callback, invokeMock;

  beforeEach(() => {
    callback = jest.fn();
    context = { functionName: "foo" };
    invokeMock = jest.fn();
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
    await recursiveHandler(handler)({ foo: "bar" }, { fiz: "baz" }, callback);
    expect(handler).toBeCalledWith(
      { foo: "bar" },
      { fiz: "baz" },
      expect.any(Function)
    );
  });

  it("recurses when the recurse callback is called", async () => {
    await recursiveHandler((event, context, recurse) => {
      recurse("payload");
    })({}, context, callback);

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
    await recursiveHandler((event, context, recurse) => recurse())(
      {},
      context,
      callback
    );
    expect(callback).toBeCalledWith(error);
  });

  it("should merge recurse payload and event object", async () => {
    await recursiveHandler((event, context, recurse) => {
      recurse({ cursor: { index: 0, lastEvaluatedKey: "bar" } });
    })({ key1: "1", key2: "2" }, context, callback);

    expect(invokeMock).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(invokeMock.mock.calls[0][0].Payload);
    expect(payload).toEqual({
      key1: "1",
      key2: "2",
      cursor: { index: 0, lastEvaluatedKey: "bar" }
    });
  });
});
