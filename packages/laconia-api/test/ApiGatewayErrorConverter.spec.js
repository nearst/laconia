const ApiGatewayErrorConverter = require("../src/ApiGatewayErrorConverter");

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

describe("ApiGatewayErrorConverter", () => {
  let errorConverter;

  beforeEach(() => {
    errorConverter = new ApiGatewayErrorConverter();
  });

  it("returns status code 500 by default", async () => {
    const response = await errorConverter.convert(new Error("boom"));
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 500
      })
    );
  });

  it("returns the status code set in the error object", async () => {
    const error = new Error("boom");
    error.statusCode = 400;
    const response = await errorConverter.convert(error);
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 400
      })
    );
  });

  it("should set isBase64Encoded to false", async () => {
    const response = await errorConverter.convert(new Error("boom"));
    expect(response).toEqual(
      expect.objectContaining({
        isBase64Encoded: false
      })
    );
  });

  it("set body based on the error message", async () => {
    const response = await errorConverter.convert(new Error("boom"));
    expect(response).toEqual(
      expect.objectContaining({
        body: "boom"
      })
    );
  });

  it("adds additional headers as per specified", async () => {
    const response = await new ApiGatewayErrorConverter({
      additionalHeaders: {
        "Access-Control-Allow-Origin": "foo",
        "Access-Control-Max-Age": "bar"
      }
    }).convert(new Error("boom"));
    expect(response).toContainHeader("Access-Control-Allow-Origin", "foo");
    expect(response).toContainHeader("Access-Control-Max-Age", "bar");
  });
});
