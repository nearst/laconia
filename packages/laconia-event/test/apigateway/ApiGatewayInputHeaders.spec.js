const ApiGatewayInputHeaders = require("../../src/apigateway/ApiGatewayInputHeaders");

describe("ApiGatewayInputHeaders", () => {
  it("should be able to get the original header set", async () => {
    const inputHeaders = new ApiGatewayInputHeaders({
      "Content-Type": "application/json"
    });
    expect(inputHeaders["Content-Type"]).toEqual("application/json");
  });

  it("should be able to get the original header set with small letter case", async () => {
    const inputHeaders = new ApiGatewayInputHeaders({
      "Content-Type": "application/json",
      Authorization: "SECRET"
    });
    expect(inputHeaders["content-type"]).toEqual("application/json");
    expect(inputHeaders["authorization"]).toEqual("SECRET");
  });
});
