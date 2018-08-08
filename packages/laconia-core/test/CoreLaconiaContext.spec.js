const CoreLaconiaContext = require("../src/CoreLaconiaContext");

describe("laconiaContext", () => {
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
