const index = require("../src/index");

describe("laconiaApi", () => {
  it("exports a function", () => {
    expect(index).toBeFunction();
  });
});
