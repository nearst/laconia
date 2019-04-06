const ApiGatewayParamsInputConverter = require("../src/ApiGatewayParamsInputConverter");

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

describe("ApiGatewayParamsInputConverter", () => {
  let inputConverter;

  beforeEach(() => {
    inputConverter = new ApiGatewayParamsInputConverter();
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
    expect(input).toEqual(
      expect.objectContaining({ payload: { body: { foo: "bar" } } })
    );
  });

  it("should convert pathParameters into payload", async () => {
    event.pathParameters = { pathParam1: "pathParam" };
    const input = await inputConverter.convert(event);
    expect(input).toEqual(
      expect.objectContaining({
        payload: expect.objectContaining({
          pathParam1: "pathParam"
        })
      })
    );
  });

  it("should convert queryStringParameters into payload", async () => {
    event.queryStringParameters = { queryParam1: "queryParam" };
    const input = await inputConverter.convert(event);
    expect(input).toEqual(
      expect.objectContaining({
        payload: expect.objectContaining({
          queryParam1: "queryParam"
        })
      })
    );
  });
});
