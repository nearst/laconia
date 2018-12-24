const createLaconiaEventHandler = require("../src/createLaconiaEventHandler");
const { LaconiaContext } = require("@laconia/core");

describe("createLaconiaEventHandler", () => {
  let callback;
  let handlerArgs;
  let event;
  let inputConverterFactory;
  let inputConverter;
  let app;

  beforeEach(() => {
    callback = jest.fn();
    event = { foo: "event" };
    handlerArgs = [event, { fiz: "context" }, callback];
    inputConverter = { convert: jest.fn() };
    inputConverterFactory = jest.fn().mockReturnValue(inputConverter);
    app = jest.fn();
  });

  it("should be called when the handler is called", async () => {
    await createLaconiaEventHandler(inputConverterFactory)(app)(...handlerArgs);
    expect(inputConverter.convert).toBeCalledWith(event);
  });

  it("should call inputConverterFactory with laconiaContext", async () => {
    await createLaconiaEventHandler(inputConverterFactory)(app)(...handlerArgs);
    expect(inputConverterFactory).toBeCalledWith(expect.any(LaconiaContext));
  });

  it("should return the app returned result", async () => {
    app.mockResolvedValue("result");
    await createLaconiaEventHandler(inputConverterFactory)(app)(...handlerArgs);
    expect(callback).toBeCalledWith(null, "result");
  });

  it("should call app with the converted event", async () => {
    inputConverter.convert.mockResolvedValue("converted value");
    await createLaconiaEventHandler(inputConverterFactory)(app)(...handlerArgs);
    expect(app).toBeCalledWith("converted value", expect.any(LaconiaContext));
  });
});
