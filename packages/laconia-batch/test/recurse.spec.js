const AWSSDK = require("aws-sdk");
const { yields } = require("@laconia/test-helper");
const recurse = require("../src/recurse");
const AWSMock = require("aws-sdk-mock");

expect.extend({
  toBeCalledWithPayload(received, expected) {
    expect(received).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(received.mock.calls[0][0].Payload);
    expect(payload).toEqual(expected);
    return { pass: true };
  }
});

describe("recurse", () => {
  let invokeMock, laconiaContext;

  beforeEach(() => {
    invokeMock = jest.fn().mockImplementation(yields({ StatusCode: 202 }));
    AWSMock.mock("Lambda", "invoke", invokeMock);

    laconiaContext = {
      event: {},
      context: { functionName: "foo" },
      $lambda: new AWSSDK.Lambda()
    };
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it("recurses when the recurse callback is called", async () => {
    await recurse(laconiaContext)();

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
    await expect(recurse(laconiaContext)()).rejects.toThrow(error);
  });

  it("throws error when payload given is not an object", async () => {
    await expect(() => recurse(laconiaContext)("non object")).toThrow(
      expect.objectContaining({
        message: expect.stringContaining("Payload must be an object")
      })
    );
  });

  it("should merge recurse payload and event object", async () => {
    laconiaContext.event = { key1: "1", key2: "2" };
    await recurse(laconiaContext)({
      cursor: { index: 0, lastEvaluatedKey: "bar" }
    });

    expect(invokeMock).toBeCalledWithPayload({
      key1: "1",
      key2: "2",
      cursor: { index: 0, lastEvaluatedKey: "bar" }
    });
  });
});
