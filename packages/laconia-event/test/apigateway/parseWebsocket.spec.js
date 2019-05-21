const parseWebSocket = require("../../src/apigateway/parseWebSocket");

const createApiGatewayEvent = ({ body = {} }) => ({
  body,
  isBase64Encoded: false
});

describe("parseWebSocket", () => {
  describe("when body is a parsable JSON string", () => {
    let event;

    beforeEach(() => {
      event = createApiGatewayEvent({
        body: JSON.stringify({ foo: "bar" })
      });
    });

    it("should convert JSON body into payload", () => {
      const body = parseWebSocket(event);
      expect(body).toEqual({ foo: "bar" });
    });

    it("should decode base64 payload", () => {
      event.body = "eyJmb28iOiJiYXIifQ==";
      event.isBase64Encoded = true;
      const body = parseWebSocket(event);
      expect(body).toEqual({ foo: "bar" });
    });
  });

  describe("when body is not a parsable JSON string", () => {
    let event;

    beforeEach(() => {
      event = createApiGatewayEvent({
        body: "foobar"
      });
    });

    it("should return string as is", () => {
      const body = parseWebSocket(event);
      expect(body).toEqual("foobar");
    });

    it("should decode base64 payload", () => {
      event.body = "Zm9vYmFy";
      event.isBase64Encoded = true;
      const body = parseWebSocket(event);
      expect(body).toEqual("foobar");
    });
  });
});
