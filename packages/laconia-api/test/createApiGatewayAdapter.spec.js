const createApiGatewayAdapter = require("../src/createApiGatewayAdapter");
const ApiGatewayBodyInputConverter = require("../src/ApiGatewayBodyInputConverter");
const ApiGatewayParamsInputConverter = require("../src/ApiGatewayParamsInputConverter");
const ApiGatewayResponseConverter = require("../src/ApiGatewayResponseConverter");

describe("createApiGatewayAdapter", () => {
  it("returns an adapter function", () => {
    const adapter = createApiGatewayAdapter()();
    expect(adapter).toBeFunction();
  });

  it("is created with ApiGatewayBodyInputConverter when inputType is body", () => {
    const adapter = createApiGatewayAdapter({
      inputType: "body",
      functional: false
    })(jest.fn());
    expect(adapter.inputConverter).toBeInstanceOf(ApiGatewayBodyInputConverter);
  });

  it("is created with ApiGatewayParamsInputConverter when inputType is params", () => {
    const adapter = createApiGatewayAdapter({
      inputType: "params",
      functional: false
    })(jest.fn());
    expect(adapter.inputConverter).toBeInstanceOf(
      ApiGatewayParamsInputConverter
    );
  });

  it("sets responseStatusCode configuration to ApiGatewayResponseConverter", () => {
    const adapter = createApiGatewayAdapter({
      functional: false,
      responseStatusCode: 202
    })(jest.fn());
    expect(adapter.outputConverter).toBeInstanceOf(ApiGatewayResponseConverter);
    expect(adapter.outputConverter.statusCode).toEqual(202);
  });

  it("sets responseAdditionalHeaders configuration to ApiGatewayResponseConverter", () => {
    const adapter = createApiGatewayAdapter({
      functional: false,
      responseAdditionalHeaders: { foo: "bar" }
    })(jest.fn());
    expect(adapter.outputConverter).toBeInstanceOf(ApiGatewayResponseConverter);
    expect(adapter.outputConverter.additionalHeaders).toEqual({ foo: "bar" });
  });

  it("throws an error when inputType is not supported", () => {
    expect(() =>
      createApiGatewayAdapter({
        inputType: "unsupported",
        functional: false
      })(jest.fn())
    ).toThrow("Unsupported inputType");
  });
});
