const index = require("../src/index");

describe("laconiaApi", () => {
  it("exposes apigateway adapter", () => {
    expect(index.apigateway).toBeFunction();
  });
});
