const createApiGatewayAdapter = require("../src/createApiGatewayAdapter");
const ApiGatewayBodyInputConverter = require("../src/ApiGatewayBodyInputConverter");
const ApiGatewayParamsInputConverter = require("../src/ApiGatewayParamsInputConverter");

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

  it("throws an error when inputType is not supported", () => {
    expect(() =>
      createApiGatewayAdapter({
        inputType: "unsupported",
        functional: false
      })(jest.fn())
    ).toThrow("Unsupported inputType");
  });
});
