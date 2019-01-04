const createLaconiaApiHandler = require("../src/createLaconiaApiHandler");
const { LaconiaContext } = require("@laconia/core");

describe("createLaconiaApiHandler", () => {
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
    inputConverter = { convert: jest.fn().mockResolvedValue({ payload: "" }) };
    inputConverterFactory = jest.fn().mockReturnValue(inputConverter);
    app = jest.fn();
  });

  it("should be called when the handler is called", async () => {
    await createLaconiaApiHandler(inputConverterFactory)(app)(...handlerArgs);
    expect(inputConverter.convert).toBeCalledWith(event);
  });

  it("should call inputConverterFactory with laconiaContext", async () => {
    await createLaconiaApiHandler(inputConverterFactory)(app)(...handlerArgs);
    expect(inputConverterFactory).toBeCalledWith(expect.any(LaconiaContext));
  });

  it("should return the app returned result", async () => {
    app.mockResolvedValue({ status: "ok" });
    await createLaconiaApiHandler(inputConverterFactory)(app)(...handlerArgs);
    expect(callback).toBeCalledWith(
      null,
      expect.objectContaining({
        body: '{"status":"ok"}',
        headers: { "content-type": "application/json" },
        statusCode: 200
      })
    );
  });

  it("should call app with the converted event payload", async () => {
    inputConverter.convert.mockResolvedValue({ payload: "converted value" });
    await createLaconiaApiHandler(inputConverterFactory)(app)(...handlerArgs);
    expect(app).toBeCalledWith("converted value", expect.any(LaconiaContext));
  });
});
