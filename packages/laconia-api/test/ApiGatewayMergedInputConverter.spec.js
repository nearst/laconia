const ApiGatewayMergedInputConverter = require("../src/ApiGatewayMergedInputConverter");

const createApiGatewayEvent = ({
  body = {},
  pathParameters = {},
  queryStringParameters = {},
  headers = {}
}) => ({
  body,
  method: "GET",
  principalId: "",
  stage: "dev",
  pathParameters,
  queryStringParameters,
  headers
});

describe("ApiGatewayMergedInputConverter", () => {
  let inputConverter;

  beforeEach(() => {
    inputConverter = new ApiGatewayMergedInputConverter();
  });

  describe("when content type is application/json", () => {
    it("should convert JSON body into input object", async () => {
      const event = createApiGatewayEvent({
        body: JSON.stringify({ foo: "bar" }),
        headers: { "Content-Type": "application/json" }
      });
      const input = await inputConverter.convert(event);
      expect(input).toEqual({ foo: "bar" });
    });

    it("should convert pathParameters into input object", async () => {
      const event = createApiGatewayEvent({
        body: JSON.stringify({}),
        pathParameters: { pathParam1: "pathParam" },
        headers: { "Content-Type": "application/json" }
      });
      const input = await inputConverter.convert(event);
      expect(input).toEqual({ pathParam1: "pathParam" });
    });

    it("should convert queryStringParameters into input object", async () => {
      const event = createApiGatewayEvent({
        body: JSON.stringify({}),
        queryStringParameters: { queryParam1: "queryParam" },
        headers: { "Content-Type": "application/json" }
      });
      const input = await inputConverter.convert(event);
      expect(input).toEqual({ queryParam1: "queryParam" });
    });
  });

  describe("when content type is x-www-form-urlencoded", () => {
    it("should be able to parse ", async () => {
      let event = createApiGatewayEvent({
        body: "field1=one&field2=two",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      });
      const input = await inputConverter.convert(event);
      expect(input).toEqual({ field1: "one", field2: "two" });
    });
  });

  xit("should ... when body is not an object", () => {});
});
