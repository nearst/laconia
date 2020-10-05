const ApiGatewayErrorConverter = require("../src/ApiGatewayNameMappingErrorConverter");
const jestResponseMatchers = require("@laconia/event/test/apigateway/jestResponseMatchers");

expect.extend(jestResponseMatchers);

describe("ApiGatewayErrorConverter", () => {
  let errorConverter;

  beforeEach(() => {
    errorConverter = new ApiGatewayErrorConverter();
  });

  it("returns status code 500 by default", async () => {
    const response = await errorConverter.convert(new Error("boom"));
    expect(response).toHaveStatusCode(500);
  });

  it("returns the status code set in the error object", async () => {
    const error = new Error("boom");
    error.statusCode = 400;
    const response = await errorConverter.convert(error);
    expect(response).toHaveStatusCode(400);
  });

  it("set body based on the error message", async () => {
    const response = await errorConverter.convert(new Error("boom"));
    expect(response).toContainBody("boom");
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

  describe("when statusCode mapping is set", () => {
    let error;
    let errorConverter;

    beforeEach(() => {
      error = new Error("boom");
      error.name = "ValidationError";

      errorConverter = new ApiGatewayErrorConverter({
        mappings: {
          "Validation.*": () => ({ statusCode: 400 })
        }
      });
    });

    it("sets status code returned by the mapping", async () => {
      const response = await errorConverter.convert(error);

      expect(response).toHaveStatusCode(400);
    });

    it("sets body with error message", async () => {
      const response = await errorConverter.convert(error);

      expect(response).toContainBody("boom");
    });
  });

  describe("when headers mapping is set", () => {
    let error;
    let errorConverter;

    beforeEach(() => {
      error = new Error("boom");
      error.name = "ValidationError";

      errorConverter = new ApiGatewayErrorConverter({
        mappings: {
          "Validation.*": () => ({
            headers: { "Access-Control-Max-Age": "overridden" }
          })
        },
        additionalHeaders: {
          "Access-Control-Max-Age": "original"
        }
      });
    });

    it("should take precedence over additionalHeaders configuration if the key is equal", async () => {
      const response = errorConverter.convert(error);
      expect(response).toContainHeader("Access-Control-Max-Age", "overridden");
    });

    it("should return 500 status code", () => {
      const response = errorConverter.convert(error);
      expect(response).toHaveStatusCode(500);
    });
  });

  describe("when body mapping is set", () => {
    let error;
    let errorConverter;

    beforeEach(() => {
      error = new Error("boom");
      error.name = "ValidationError";

      errorConverter = new ApiGatewayErrorConverter();
    });

    it("should return the body set by the mapping", async () => {
      errorConverter.mappings = {
        "Validation.*": error => ({
          body: `Modified ${error.message}`
        })
      };
      const response = await errorConverter.convert(error);

      expect(response).toContainBody("Modified boom");
      expect(response).toContainHeader("Content-Type", "text/plain");
    });

    it("should return JSON stringify body when an object is returned", async () => {
      errorConverter.mappings = {
        "Validation.*": () => ({
          body: { foo: "bar" }
        })
      };
      const response = await errorConverter.convert(error);

      expect(response).toContainBody('{"foo":"bar"}');
      expect(response).toContainHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );
    });
  });

  describe("when there are multiple mappings", () => {
    let error;

    beforeEach(() => {
      error = new Error("boom");
      error.name = "ValidationError";
    });

    it("should match based on the order set in the mapping", () => {
      errorConverter = new ApiGatewayErrorConverter({
        mappings: new Map([
          ["Validation.*", () => ({ statusCode: 200 })],
          [".*Error", () => ({ statusCode: 300 })]
        ])
      });
      const response = errorConverter.convert(error);
      expect(response).toHaveStatusCode(200);
    });

    it("should match based on the order set in the mapping", () => {
      errorConverter = new ApiGatewayErrorConverter({
        mappings: new Map([
          [".*Error", () => ({ statusCode: 300 })],
          ["Validation.*", () => ({ statusCode: 200 })]
        ])
      });
      const response = errorConverter.convert(error);
      expect(response).toHaveStatusCode(300);
    });
  });

  describe("when no mapping matched", () => {
    it("should fallback to default behaviour", async () => {
      const error = new Error("boom");
      error.name = "ValidationError";

      errorConverter = new ApiGatewayErrorConverter({
        mappings: {
          SomethingIsRequired: () => ({
            statusCode: 400
          })
        }
      });

      const response = errorConverter.convert(error);
      expect(response).toHaveStatusCode(500);
    });
  });

  describe("when mapping happens by the error message", () => {
    const errorConverter = new ApiGatewayErrorConverter({
      mappings: {
        "Validation.*": () => ({ statusCode: 400 }),
        "Other.*": () => ({ statusCode: 500 })
      }
    });

    it("should match based on the error name", async () => {
      const error = new Error("boom");
      error.name = "ValidationError";

      const response = await errorConverter.convert(error);
      expect(response).toContainBody("boom");
      expect(response).toHaveStatusCode(400);
    });

    it("should match based on the error message", async () => {
      const error = new Error("Other validation error");

      const response = await errorConverter.convert(error);
      expect(response).toContainBody("Other validation error");
      expect(response).toHaveStatusCode(500);
    });

    it("error name should take precedence", async () => {
      const error = new Error("Other validation error");
      error.name = "ValidationError";

      const response = await errorConverter.convert(error);
      expect(response).toContainBody("Other validation error");
      expect(response).toHaveStatusCode(400);
    });
  });
});
