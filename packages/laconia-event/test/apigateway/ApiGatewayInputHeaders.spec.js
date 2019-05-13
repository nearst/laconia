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
});
