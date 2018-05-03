const LaconiaContext = require("../src/LaconiaContext");

describe("laconiaContext", () => {
  it("should be able to inject new component", () => {
    const lc = new LaconiaContext({});
    lc.inject({ foo: "bar" });
    expect(lc).toHaveProperty("foo", "bar");
    lc.inject({ boo: "baz" });
    expect(lc).toHaveProperty("foo", "bar");
    expect(lc).toHaveProperty("boo", "baz");
  });

  it("should be able to override component", () => {
    const lc = new LaconiaContext({});
    lc.inject({ env: "bar" });
    expect(lc).toHaveProperty("env", "bar");
  });
});
