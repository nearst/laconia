const { Readable } = require("stream");
const ApiGatewayResponse = require("../../src/apigateway/ApiGatewayResponse");
const jestResponseMatchers = require("./jestResponseMatchers");

expect.extend(jestResponseMatchers);

describe("ApiGatewayResponse", () => {
  it("returns status code 200 by default", async () => {
    const response = await ApiGatewayResponse.create("output");
    expect(response).toHaveStatusCode(200);
  });

  it("returns the status code specified", async () => {
    const response = await ApiGatewayResponse.create("output", 202);
    expect(response).toHaveStatusCode(202);
  });

  it("adds additional headers as per specified", async () => {
    const response = await ApiGatewayResponse.create("output", 200, {
      "Access-Control-Allow-Origin": "foo",
      "Access-Control-Max-Age": "bar"
    });
    expect(response).toContainHeader("Content-Type", expect.any(String));
    expect(response).toContainHeader("Access-Control-Allow-Origin", "foo");
    expect(response).toContainHeader("Access-Control-Max-Age", "bar");
  });

  describe("when converting an object", () => {
    const output = { foo: "bar" };

    it("should set body to the object's JSON string", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainBody('{"foo":"bar"}');
    });

    it("should set Content-Type header to application/json", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );
    });

    it("should set isBase64Encoded to false", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toBeBase64Encoded(false);
    });
  });

  describe("when converting a string", () => {
    const output = "foo";

    it("should set body to the output string", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainBody(output);
    });

    it("should set Content-Type header to text/plain", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainHeader("Content-Type", "text/plain");
    });

    it("should set isBase64Encoded to false", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toBeBase64Encoded(false);
    });
  });

  describe("when converting a number", () => {
    const output = 4;

    it("should set body to the stringified number", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainBody("4");
    });

    it("should set Content-Type header to text/plain", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainHeader("Content-Type", "text/plain");
    });

    it("should set isBase64Encoded to false", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toBeBase64Encoded(false);
    });
  });

  describe("when converting an array", () => {
    const output = ["foo", "bar"];

    it("should set body to the object's JSON string", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainBody('["foo","bar"]');
    });

    it("should set Content-Type header to application/json", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );
    });

    it("should set isBase64Encoded to false", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toBeBase64Encoded(false);
    });
  });

  describe("when converting a Buffer", () => {
    const output = Buffer.from("foo Bar");

    it("should set body to the object's Base64 string", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainBody("Zm9vIEJhcg==");
    });

    it("should set Content-Type header to application/octet-stream", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toContainHeader(
        "Content-Type",
        "application/octet-stream"
      );
    });

    it("should set isBase64Encoded to true", async () => {
      const response = await ApiGatewayResponse.create(output);
      expect(response).toBeBase64Encoded(true);
    });
  });
});
