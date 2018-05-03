const LaconiaContext = require("../src/LaconiaContext");

describe("laconiaContext", () => {
  it("should be able to register new component", () => {
    const lc = new LaconiaContext({});
    lc.register({ foo: "bar" });
    expect(lc).toHaveProperty("foo", "bar");
    lc.register({ boo: "baz" });
    expect(lc).toHaveProperty("foo", "bar");
    expect(lc).toHaveProperty("boo", "baz");
  });

  it("should be able to override component", () => {
    const lc = new LaconiaContext({});
    lc.register({ env: "bar" });
    expect(lc).toHaveProperty("env", "bar");
  });
});
