const ApiGatewayWebsocketRequestContext = require("../../src/apigateway/ApiGatewayWebsocketRequestContext");

describe("ApiGatewayWebsocketRequestContext", () => {
  it("should create a simple object", async () => {
    const test = { foo: "bar" };
    const apiEvent = new ApiGatewayWebsocketRequestContext(test);
    expect(apiEvent).toEqual(test);
  });
});
