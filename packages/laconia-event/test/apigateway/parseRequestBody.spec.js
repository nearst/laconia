const parseRequestBody = require("../../src/apigateway/parseRequestBody");
const ApiGatewayInputHeaders = require("../../src/apigateway/ApiGatewayInputHeaders");

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

describe("parseRequestBody", () => {
  describe("when content type is application/json", () => {
    let event;

    let headers;

    beforeEach(() => {
      event = createApiGatewayEvent({
        body: JSON.stringify({ foo: "bar" }),
        headers: { "Content-Type": "application/json; charset=UTF-8" }
      });

      headers = new ApiGatewayInputHeaders(event.headers);
    });

    it("should convert JSON body into payload", () => {
      const body = parseRequestBody(event, headers);
      expect(body).toEqual({ foo: "bar" });
    });

    it("should decode base64 payload", () => {
      event.body = "eyJmb28iOiJiYXIifQ==";
      event.isBase64Encoded = true;
      const body = parseRequestBody(event, headers);
      expect(body).toEqual({ foo: "bar" });
    });

    it("should throw an error when body is not JSON parsable", () => {
      event.body = [];
      expect(() => parseRequestBody(event, headers)).toThrow(
        "The request body is not JSON even though the Content-Type is set to application/json"
      );
    });
  });

  describe("when content type is x-www-form-urlencoded", () => {
    it("should parse form data into payload", () => {
      let event = createApiGatewayEvent({
        body: "field1=one&field2=two",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      });
      const body = parseRequestBody(
        event,
        new ApiGatewayInputHeaders(event.headers)
      );
      expect(body).toEqual(
        expect.objectContaining({ field1: "one", field2: "two" })
      );
    });
  });

  describe("when body is a buffer", () => {
    it("should set the payload as is", () => {
      const bufferBody = Buffer.from("foo");
      const event = createApiGatewayEvent({
        body: bufferBody
      });
      const body = parseRequestBody(event, {});
      expect(body).toEqual(bufferBody);
    });
  });

  describe("when content type header is lowercase", () => {
    it("should still correctly determine the type", () => {
      const event = createApiGatewayEvent({
        body: JSON.stringify({ foo: "bar" }),
        headers: { "content-type": "application/json; charset=UTF-8" }
      });

      const body = parseRequestBody(
        event,
        new ApiGatewayInputHeaders(event.headers)
      );
      expect(body).toEqual({ foo: "bar" });
    });
  });
});
