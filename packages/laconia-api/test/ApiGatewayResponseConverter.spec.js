const ApiGatewayResponseConverter = require("../src/ApiGatewayResponseConverter");

expect.extend({
  toContainBody(input, body) {
    expect(input).toEqual(expect.objectContaining({ body }));
    return { pass: true };
  },
  toContainHeader(input, headerName, headerValue) {
    expect(input).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          [headerName]: headerValue
        })
      })
    );
    return { pass: true };
  }
});

describe("ApiGatewayResponseConverter", () => {
  let responseConverter;

  beforeEach(() => {
    responseConverter = new ApiGatewayResponseConverter();
  });

  describe("when converting an object", () => {
    const output = { foo: "bar" };

    it("should set body to the object's JSON string", async () => {
      const input = await responseConverter.convert(output);
      expect(input).toContainBody('{"foo":"bar"}');
    });

    it("should set Content-Type header to application/json", async () => {
      const input = await responseConverter.convert(output);
      expect(input).toContainHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );
    });

    it("should set isBase64Encoded to false", async () => {
      const input = await responseConverter.convert(output);
      expect(input).toEqual(
        expect.objectContaining({
          isBase64Encoded: false
        })
      );
    });
  });

  describe("when converting a string", () => {
    const output = "foo";

    it("should set body to the output string", async () => {
      const input = await responseConverter.convert(output);
      expect(input).toContainBody(output);
    });

    it("should set Content-Type header to text/plain", async () => {
      const input = await responseConverter.convert(output);
      expect(input).toContainHeader("Content-Type", "text/plain");
    });

    it("should set isBase64Encoded to false", async () => {
      const input = await responseConverter.convert(output);
      expect(input).toEqual(
        expect.objectContaining({
          isBase64Encoded: false
        })
      );
    });
  });

  describe("when converting a number", () => {
    const output = 4;

    it("should set body to the stringified number", async () => {
      const input = await responseConverter.convert(output);
      expect(input).toContainBody("4");
    });

    it("should set Content-Type header to text/plain", async () => {
      const input = await responseConverter.convert(output);
      expect(input).toContainHeader("Content-Type", "text/plain");
    });

    it("should set isBase64Encoded to false", async () => {
      const input = await responseConverter.convert(output);
      expect(input).toEqual(
        expect.objectContaining({
          isBase64Encoded: false
        })
      );
    });
  });
});
