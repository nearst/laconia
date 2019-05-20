const ApiGatewayWebsocketEvent = require("../../src/apigateway/ApiGatewayWebsocketEvent");

const createApiGatewayEvent = ({ body = {}, requestContext = {} }) => ({
  body,
  requestContext,
  isBase64Encoded: false
});

describe("ApiGatewayWebsocketEvent", () => {
  let event;

  beforeEach(() => {
    event = createApiGatewayEvent({
      body: JSON.stringify({ foo: "bar" }),
      requestContext: { routeKey: "$default" }
    });
  });

  it("should parse event into body", async () => {
    const apiEvent = await ApiGatewayWebsocketEvent.fromRaw(event);
    expect(apiEvent.body).toEqual({ foo: "bar" });
  });

  it("should have requestContext", async () => {
    const apiEvent = await ApiGatewayWebsocketEvent.fromRaw(event);

    expect(apiEvent.requestContext).toEqual(
      expect.objectContaining({ routeKey: "$default" })
    );
  });
});
