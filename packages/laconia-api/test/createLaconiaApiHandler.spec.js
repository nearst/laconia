const createLaconiaApiHandler = require("../src/createLaconiaApiHandler");
const { LaconiaContext } = require("@laconia/core");

describe("createLaconiaApiHandler", () => {
  let callback;
  let handlerArgs;
  let event;
  let inputConverterFactory;
  let inputConverter;
  let responseConverter;
  let responseConverterFactory;
  let app;

  beforeEach(() => {
    callback = jest.fn();
    event = { foo: "event" };
    handlerArgs = [event, { fiz: "context" }, callback];
    inputConverter = { convert: jest.fn().mockResolvedValue({ payload: "" }) };
    inputConverterFactory = jest.fn().mockReturnValue(inputConverter);
    responseConverter = {
      convert: jest.fn().mockResolvedValue({
        body: '{"status":"ok"}',
        headers: { "content-type": "application/json" },
        statusCode: 200
      })
    };
    responseConverterFactory = jest.fn().mockReturnValue(responseConverter);
    app = jest.fn();
  });

  it("should be called when the handler is called", async () => {
    await createLaconiaApiHandler(
      inputConverterFactory,
      responseConverterFactory
    )(app)(...handlerArgs);
    expect(inputConverter.convert).toBeCalledWith(event);
  });

  it("should call inputConverterFactory with laconiaContext", async () => {
    await createLaconiaApiHandler(
      inputConverterFactory,
      responseConverterFactory
    )(app)(...handlerArgs);
    expect(inputConverterFactory).toBeCalledWith(expect.any(LaconiaContext));
  });

  it("should call responseConverter with laconiaContext", async () => {
    await createLaconiaApiHandler(
      inputConverterFactory,
      responseConverterFactory
    )(app)(...handlerArgs);
    expect(responseConverterFactory).toBeCalledWith(expect.any(LaconiaContext));
  });

  it("should return the output converter returned result", async () => {
    app.mockResolvedValue({ status: "ok" });
    await createLaconiaApiHandler(
      inputConverterFactory,
      responseConverterFactory
    )(app)(...handlerArgs);
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
    await createLaconiaApiHandler(
      inputConverterFactory,
      responseConverterFactory
    )(app)(...handlerArgs);
    expect(app).toBeCalledWith("converted value", expect.any(LaconiaContext));
  });

  it("should call the app with headers parameter when headers option is set to true", async () => {
    inputConverter.convert.mockResolvedValue({
      payload: "converted value",
      headers: { header1: "value1" }
    });
    await createLaconiaApiHandler(
      inputConverterFactory,
      responseConverterFactory,
      { headers: true }
    )(app)(...handlerArgs);
    expect(app).toBeCalledWith(
      "converted value",
      { header1: "value1" },
      expect.any(LaconiaContext)
    );
  });
});
