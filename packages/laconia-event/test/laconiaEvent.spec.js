const laconiaEvent = require("../src/laconiaEvent");

describe("laconiaEvent", () => {
  let callback;
  let handlerArgs;
  let event;

  beforeEach(() => {
    callback = jest.fn();
    event = { foo: "event" };
    handlerArgs = [event, { fiz: "context" }, callback];
  });

  it("should be called when the handler is called", async () => {
    const inputConverter = { convert: jest.fn() };
    const handler = jest.fn();
    await laconiaEvent(inputConverter)(handler)(...handlerArgs);

    expect(inputConverter.convert).toBeCalledWith(event);
  });

  xit("should return the app returned result", async () => {});
  xit("should call app with the converted event", async () => {});
});
