const parseWebsocket = require("../../src/apigateway/parseWebsocket");

const createApiGatewayEvent = ({ body = {} }) => ({
  body,
  isBase64Encoded: false
});

describe("parseWebsocket", () => {
  describe("when body is a parsable JSON string", () => {
    let event;

    beforeEach(() => {
      event = createApiGatewayEvent({
        body: JSON.stringify({ foo: "bar" })
      });
    });

    it("should convert JSON body into payload", () => {
      const body = parseWebsocket(event);
      expect(body).toEqual({ foo: "bar" });
    });

    it("should decode base64 payload", () => {
      event.body = "eyJmb28iOiJiYXIifQ==";
      event.isBase64Encoded = true;
      const body = parseWebsocket(event);
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
      const body = parseWebsocket(event);
      expect(body).toEqual("foobar");
    });

    it("should decode base64 payload", () => {
      event.body = "Zm9vYmFy";
      event.isBase64Encoded = true;
      const body = parseWebsocket(event);
      expect(body).toEqual("foobar");
    });
  });
});
