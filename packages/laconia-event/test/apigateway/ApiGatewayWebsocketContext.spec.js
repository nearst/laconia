const ApiGatewayWebsocketContext = require("../../src/apigateway/ApiGatewayWebsocketContext");

describe("ApiGatewayWebsocketContext", () => {
  it("should create a simple object", async () => {
    const test = { foo: "bar" };
    const apiEvent = new ApiGatewayWebsocketContext(test);
    expect(apiEvent).toEqual(test);
  });
});
