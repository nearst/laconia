const ApiGatewayBodyInputConverter = require("../src/ApiGatewayBodyInputConverter");

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

describe("ApiGatewayBodyInputConverter", () => {
  let inputConverter;

  beforeEach(() => {
    inputConverter = new ApiGatewayBodyInputConverter();
  });

  describe("when content type is application/json", () => {
    it("should convert JSON body into input object", async () => {
      const event = createApiGatewayEvent({
        body: JSON.stringify({ foo: "bar" }),
        headers: { "Content-Type": "application/json" }
      });
      const input = await inputConverter.convert(event);
      expect(input).toEqual(
        expect.objectContaining({ payload: { foo: "bar" } })
      );
    });

    it("should convert pathParameters into input object", async () => {
      const event = createApiGatewayEvent({
        body: JSON.stringify({}),
        pathParameters: { pathParam1: "pathParam" },
        headers: { "Content-Type": "application/json" }
      });
      const input = await inputConverter.convert(event);
      expect(input).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({ pathParam1: "pathParam" })
        })
      );
    });

    it("should convert queryStringParameters into input object", async () => {
      const event = createApiGatewayEvent({
        body: JSON.stringify({}),
        queryStringParameters: { queryParam1: "queryParam" },
        headers: { "Content-Type": "application/json" }
      });
      const input = await inputConverter.convert(event);
      expect(input).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({ queryParam1: "queryParam" })
        })
      );
    });
  });

  describe("when content type is x-www-form-urlencoded", () => {
    it("should parse form data into payload", async () => {
      let event = createApiGatewayEvent({
        body: "field1=one&field2=two",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      });
      const input = await inputConverter.convert(event);
      expect(input).toEqual(
        expect.objectContaining({ payload: { field1: "one", field2: "two" } })
      );
    });
  });

  xit("should ... when body is not an object", () => {});
});
