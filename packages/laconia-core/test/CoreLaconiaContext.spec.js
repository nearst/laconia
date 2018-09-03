const CoreLaconiaContext = require("../src/CoreLaconiaContext");

describe("laconiaContext", () => {
  it("should include process.env", () => {
    const lc = new CoreLaconiaContext({});
    expect(lc).toHaveProperty("env", process.env);
  });

  it("should make built-in instances available after being overridden", () => {
    const lc = new CoreLaconiaContext({});
    lc.registerInstances({ env: "bar" });
    expect(lc).toHaveProperty("$env", process.env);
  });
});
