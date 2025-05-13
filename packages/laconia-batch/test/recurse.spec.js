const { mockClient } = require("aws-sdk-client-mock");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const recurse = require("../src/recurse");

expect.extend({
  toBeCalledWithPayload(received, expected) {
    const calls = received.calls();
    expect(calls.length).toBe(1);
    const payload = JSON.parse(calls[0].args[0].input.Payload);
    expect(payload).toEqual(expected);
    return { pass: true };
  }
});

describe("recurse", () => {
  let lambdaMock, laconiaContext;

  beforeEach(() => {
    lambdaMock = mockClient(LambdaClient);
    lambdaMock.on(InvokeCommand).resolves({ StatusCode: 202 });

    laconiaContext = {
      event: {},
      context: { functionName: "foo" },
      $lambda: new LambdaClient()
    };
  });

  afterEach(() => {
    lambdaMock.reset();
  });

  it("recurses when the recurse callback is called", async () => {
    await recurse(laconiaContext)();

    const calls = lambdaMock.calls();
    expect(calls.length).toBe(1);
    expect(calls[0].args[0].input).toEqual(
      expect.objectContaining({
        FunctionName: "foo",
        InvocationType: "Event"
      })
    );
  });

  it("throws error when lambda recursion failed", async () => {
    const error = new Error("boom");
    lambdaMock.on(InvokeCommand).rejects(error);
    await expect(recurse(laconiaContext)()).rejects.toThrow(error);
  });

  it("throws error when payload given is not an object", async () => {
    const error = new Error("Payload must be an object");
    await expect(recurse(laconiaContext)("non object")).rejects.toThrow(error);
  });

  it("should merge recurse payload and event object", async () => {
    laconiaContext.event = { key1: "1", key2: "2" };
    await recurse(laconiaContext)({
      cursor: { index: 0, lastEvaluatedKey: "bar" }
    });

    expect(lambdaMock).toBeCalledWithPayload({
      key1: "1",
      key2: "2",
      cursor: { index: 0, lastEvaluatedKey: "bar" }
    });
  });
});
