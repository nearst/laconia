const laconiaContext = require("../src/coreLaconiaContext");
const invoke = require("../src/invoke");

describe("laconiaContext", () => {
  it("should include invoke function", () => {
    const lc = laconiaContext({});
    expect(lc).toHaveProperty("invoke", invoke);
  });

  it("should include instantiated recurse function", () => {
    const lc = laconiaContext({});
    expect(lc).toHaveProperty("recurse", expect.any(Function));
  });

  it("should include process.env", () => {
    const lc = laconiaContext({});
    expect(lc).toHaveProperty("env", process.env);
  });

  it("should be able to inject new member", () => {
    const lc = laconiaContext({});
    lc.inject({ foo: "bar" });
    expect(lc).toHaveProperty("foo", "bar");
    lc.inject({ boo: "baz" });
    expect(lc).toHaveProperty("foo", "bar");
    expect(lc).toHaveProperty("boo", "baz");
  });

  it("should be able to override member", () => {
    const lc = laconiaContext({});
    lc.inject({ env: "bar" });
    expect(lc).toHaveProperty("env", "bar");
  });

  it("should make built-in members available after being overridden", () => {
    const lc = laconiaContext({});
    lc.inject({ env: "bar" });
    expect(lc).toHaveProperty("$env", process.env);
  });
});
