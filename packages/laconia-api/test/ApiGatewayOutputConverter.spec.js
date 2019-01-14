const ApiGatewayOutputConverter = require("../src/ApiGatewayOutputConverter");

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

describe("ApiGatewayOutputConverter", () => {
  let outputConverter;

  beforeEach(() => {
    outputConverter = new ApiGatewayOutputConverter();
  });

  it("returns status code 200 by default", async () => {
    const response = await outputConverter.convert("output");
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );
  });

  it("returns the status code specified", async () => {
    const response = await new ApiGatewayOutputConverter({
      statusCode: 202
    }).convert("output");
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 202
      })
    );
  });

  it("adds additional headers as per specified", async () => {
    const response = await new ApiGatewayOutputConverter({
      additionalHeaders: {
        "Access-Control-Allow-Origin": "foo",
        "Access-Control-Max-Age": "bar"
      }
    }).convert("output");
    expect(response).toContainHeader("Content-Type", expect.any(String));
    expect(response).toContainHeader("Access-Control-Allow-Origin", "foo");
    expect(response).toContainHeader("Access-Control-Max-Age", "bar");
  });

  describe("when converting an object", () => {
    const output = { foo: "bar" };

    it("should set body to the object's JSON string", async () => {
      const response = await outputConverter.convert(output);
      expect(response).toContainBody('{"foo":"bar"}');
    });

    it("should set Content-Type header to application/json", async () => {
      const response = await outputConverter.convert(output);
      expect(response).toContainHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );
    });

    it("should set isBase64Encoded to false", async () => {
      const response = await outputConverter.convert(output);
      expect(response).toEqual(
        expect.objectContaining({
          isBase64Encoded: false
        })
      );
    });
  });

  describe("when converting a string", () => {
    const output = "foo";

    it("should set body to the output string", async () => {
      const response = await outputConverter.convert(output);
      expect(response).toContainBody(output);
    });

    it("should set Content-Type header to text/plain", async () => {
      const response = await outputConverter.convert(output);
      expect(response).toContainHeader("Content-Type", "text/plain");
    });

    it("should set isBase64Encoded to false", async () => {
      const response = await outputConverter.convert(output);
      expect(response).toEqual(
        expect.objectContaining({
          isBase64Encoded: false
        })
      );
    });
  });

  describe("when converting a number", () => {
    const output = 4;

    it("should set body to the stringified number", async () => {
      const response = await outputConverter.convert(output);
      expect(response).toContainBody("4");
    });

    it("should set Content-Type header to text/plain", async () => {
      const response = await outputConverter.convert(output);
      expect(response).toContainHeader("Content-Type", "text/plain");
    });

    it("should set isBase64Encoded to false", async () => {
      const response = await outputConverter.convert(output);
      expect(response).toEqual(
        expect.objectContaining({
          isBase64Encoded: false
        })
      );
    });
  });
});
