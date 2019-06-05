const ApiGatewayInputHeaders = require("../../src/apigateway/ApiGatewayInputHeaders");

describe("ApiGatewayInputHeaders", () => {
  it("should be able to get the original header set", async () => {
    const inputHeaders = new ApiGatewayInputHeaders({
      "Content-Type": "application/json"
    });
    expect(inputHeaders["Content-Type"]).toEqual("application/json");
  });

  it("should be able to get the original header regardless of case", async () => {
    const inputHeaders = new ApiGatewayInputHeaders({
      "content-TYPE": "application/json",
      AUTHORization: "SECRET"
    });
    expect(inputHeaders["CONTENT-type"]).toEqual("application/json");
    expect(inputHeaders["authorIZATION"]).toEqual("SECRET");
  });

  it("should should allow access to existing properties using normal case", async () => {
    const inputHeaders = new ApiGatewayInputHeaders({
      "content-type": "application/json"
    });

    expect(inputHeaders.hasOwnProperty("content-type")).toBeTrue();
  });

  it("should should allow access to existing methods using normal case", async () => {
    const inputHeaders = new ApiGatewayInputHeaders({});
    expect(inputHeaders.toString()).toEqual("[object Object]");
  });

  it("should should accept test events from API Gateway web UI", async () => {
    const inputHeaders = new ApiGatewayInputHeaders(null);
    expect(inputHeaders).toEqual(expect.anything());
  });
});
