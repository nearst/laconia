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
  headers,
  isBase64Encoded: false
});

describe("ApiGatewayBodyInputConverter", () => {
  let inputConverter;

  beforeEach(() => {
    inputConverter = new ApiGatewayBodyInputConverter();
  });

  describe("when content type is application/json", () => {
    let event;

    beforeEach(() => {
      event = createApiGatewayEvent({
        body: JSON.stringify({ foo: "bar" }),
        headers: { "Content-Type": "application/json" }
      });
    });

    it("should convert JSON body into payload", async () => {
      const input = await inputConverter.convert(event);
      expect(input).toEqual(
        expect.objectContaining({ payload: { foo: "bar" } })
      );
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
            "Content-Type": "application/json"
          })
        })
      );
    });

    it("should decode base64 payload", async () => {
      event.body = "eyJmb28iOiJiYXIifQ==";
      event.isBase64Encoded = true;
      const input = await inputConverter.convert(event);
      expect(input).toEqual(
        expect.objectContaining({ payload: { foo: "bar" } })
      );
    });

    xit("should throw an error when body is not JSON parsable", () => {});
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

  describe("when body is a buffer", () => {
    xit("should set the payload as is", () => {});
  });
});
