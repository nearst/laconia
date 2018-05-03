const CoreLaconiaContext = require("../src/CoreLaconiaContext");
const invoke = require("../src/invoke");

describe("laconiaContext", () => {
  it("should include invoke function", () => {
    const lc = new CoreLaconiaContext({});
    expect(lc).toHaveProperty("invoke", invoke);
  });

  it("should include instantiated recurse function", () => {
    const lc = new CoreLaconiaContext({});
    expect(lc).toHaveProperty("recurse", expect.any(Function));
  });

  it("should include process.env", () => {
    const lc = new CoreLaconiaContext({});
    expect(lc).toHaveProperty("env", process.env);
  });

  it("should make built-in component available after being overridden", () => {
    const lc = new CoreLaconiaContext({});
    lc.register({ env: "bar" });
    expect(lc).toHaveProperty("$env", process.env);
  });
});
