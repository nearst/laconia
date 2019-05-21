const ApiGatewayWebSocketEvent = require("../../src/apigateway/ApiGatewayWebSocketEvent");

const createApiGatewayEvent = ({ body = {}, requestContext = {} }) => ({
  body,
  requestContext,
  isBase64Encoded: false
});

describe("ApiGatewayWebSocketEvent", () => {
  let event;

  beforeEach(() => {
    event = createApiGatewayEvent({
      body: JSON.stringify({ foo: "bar" }),
      requestContext: { routeKey: "$default" }
    });
  });

  it("should parse event into body", async () => {
    const apiEvent = await ApiGatewayWebSocketEvent.fromRaw(event);
    expect(apiEvent.body).toEqual({ foo: "bar" });
  });

  it("should have requestContext", async () => {
    const apiEvent = await ApiGatewayWebSocketEvent.fromRaw(event);

    expect(apiEvent.context).toEqual(
      expect.objectContaining({ routeKey: "$default" })
    );
  });
});
