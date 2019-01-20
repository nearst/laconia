const ApiGatewayBodyInputConverter = require("../src/ApiGatewayBodyInputConverter");

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

describe("ApiGatewayBodyInputConverter", () => {
  let inputConverter;

  beforeEach(() => {
    inputConverter = new ApiGatewayBodyInputConverter();
  });

  let event;

  beforeEach(() => {
    event = createApiGatewayEvent({
      body: JSON.stringify({ foo: "bar" }),
      headers: { "Content-Type": "application/json; charset=UTF-8" }
    });
  });

  it("should convert JSON body into payload", async () => {
    const input = await inputConverter.convert(event);
    expect(input).toEqual(expect.objectContaining({ payload: { foo: "bar" } }));
  });

  it("should convert pathParameters into headers", async () => {
    event.pathParameters = { pathParam1: "pathParam" };
    const input = await inputConverter.convert(event);
    expect(input).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({ pathParam1: "pathParam" })
      })
    );
  });

  it("should convert queryStringParameters into headers", async () => {
    event.queryStringParameters = { queryParam1: "queryParam" };
    const input = await inputConverter.convert(event);
    expect(input).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({ queryParam1: "queryParam" })
      })
    );
  });

  it("should keep original headers", async () => {
    event.queryStringParameters = { queryParam1: "queryParam" };
    const input = await inputConverter.convert(event);
    expect(input).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json; charset=UTF-8"
        })
      })
    );
  });

  it("should be able to retrieve headers with node.js canonical format", async () => {
    event.queryStringParameters = { queryParam1: "queryParam" };
    const input = await inputConverter.convert(event);
    expect(input.headers["content-type"]).toEqual(
      "application/json; charset=UTF-8"
    );
  });
});
