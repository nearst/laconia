const EventAdapter = require("../src/EventAdapter");

describe("EventAdapter", () => {
  let event;
  let inputConverter;
  let app;
  let laconiaContext;

  beforeEach(() => {
    event = { foo: "event" };
    inputConverter = { convert: jest.fn() };
    app = jest.fn();
    laconiaContext = { dependency: "some dependencies " };
  });

  it("should call inputConverter", async () => {
    const adapter = new EventAdapter(app, inputConverter);
    await adapter.handle(event, laconiaContext);
    expect(inputConverter.convert).toBeCalledWith(event);
  });

  it("should return the app returned result", async () => {
    app.mockResolvedValue("result");
    const adapter = new EventAdapter(app, inputConverter);
    const result = await adapter.handle(event, laconiaContext);
    expect(result).toEqual("result");
  });

  it("should call app with the converted event", async () => {
    inputConverter.convert.mockResolvedValue("converted value");
    const adapter = new EventAdapter(app, inputConverter);
    await adapter.handle(event, laconiaContext);
    expect(app).toBeCalledWith("converted value", laconiaContext);
  });

  it("should be able to be called as function", async () => {
    app.mockResolvedValue("result");
    const adapter = new EventAdapter(app, inputConverter);
    const result = await adapter.toFunction()(event, laconiaContext);
    expect(result).toEqual("result");
  });
});
