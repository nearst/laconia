const EventAdapter = require("../src/EventAdapter");

describe("EventAdapter", () => {
  let event;
  let inputConverterFactory;
  let inputConverter;
  let app;
  let laconiaContext;

  beforeEach(() => {
    event = { foo: "event" };
    inputConverter = { convert: jest.fn() };
    inputConverterFactory = jest.fn().mockReturnValue(inputConverter);
    app = jest.fn();
    laconiaContext = { dependency: "some dependencies " };
  });

  it("should be called when the handler is called", async () => {
    const adapter = new EventAdapter(app, inputConverterFactory);
    await adapter.handle(event, laconiaContext);
    expect(inputConverter.convert).toBeCalledWith(event);
  });

  it("should call inputConverterFactory with laconiaContext", async () => {
    const adapter = new EventAdapter(app, inputConverterFactory);
    await adapter.handle(event, laconiaContext);
    expect(inputConverterFactory).toBeCalledWith(laconiaContext);
  });

  it("should return the app returned result", async () => {
    app.mockResolvedValue("result");
    const adapter = new EventAdapter(app, inputConverterFactory);
    const result = await adapter.handle(event, laconiaContext);
    expect(result).toEqual("result");
  });

  it("should call app with the converted event", async () => {
    inputConverter.convert.mockResolvedValue("converted value");
    const adapter = new EventAdapter(app, inputConverterFactory);
    await adapter.handle(event, laconiaContext);
    expect(app).toBeCalledWith("converted value", laconiaContext);
  });
});
