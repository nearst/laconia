const ApiGatewayEvent = require("../../src/apigateway/ApiGatewayEvent");

const createApiGatewayEvent = ({
  body = {},
  pathParameters = undefined,
  queryStringParameters = undefined,
  headers = {}
}) => ({
  body,
  method: "GET",
  principalId: "",
  stage: "dev",
  pathParameters,
  queryStringParameters,
  headers,
  isBase64Encoded: false
});

describe("ApiGatewayEvent", () => {
  let event;

  beforeEach(() => {
    event = createApiGatewayEvent({
      body: JSON.stringify({ foo: "bar" }),
      headers: { "Content-Type": "application/json; charset=UTF-8" }
    });
  });

  it("should parse event into body", async () => {
    const apiGatewayEvent = await ApiGatewayEvent.fromRaw(event);
    expect(apiGatewayEvent.body).toEqual({ foo: "bar" });
  });

  it("should not attempt to parse body when its null", async () => {
    event.body = null;
    const apiGatewayEvent = await ApiGatewayEvent.fromRaw(event);
    expect(apiGatewayEvent.body).toEqual(null);
  });

  it("should not attempt to parse body when its undefined", async () => {
    event.body = undefined;
    const apiGatewayEvent = await ApiGatewayEvent.fromRaw(event);
    expect(apiGatewayEvent.body).toEqual(null);
  });

  it("should convert pathParameters into params", async () => {
    event.pathParameters = { pathParam1: "pathParam" };
    const apiGatewayEvent = await ApiGatewayEvent.fromRaw(event);

    expect(apiGatewayEvent.params).toEqual(
      expect.objectContaining({ pathParam1: "pathParam" })
    );
  });

  it("should convert queryStringParameters into params", async () => {
    event.queryStringParameters = { queryParam1: "queryParam" };
    const apiGatewayEvent = await ApiGatewayEvent.fromRaw(event);
    expect(apiGatewayEvent.params).toEqual(
      expect.objectContaining({ queryParam1: "queryParam" })
    );
  });

  it("should be able to retrieve headers with node.js canonical format", async () => {
    const apiGatewayEvent = await ApiGatewayEvent.fromRaw(event);
    expect(apiGatewayEvent.headers["content-type"]).toEqual(
      "application/json; charset=UTF-8"
    );
  });
});
