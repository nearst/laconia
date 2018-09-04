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

  describe("#registerFactory", () => {
    it("should memoize all factory fns by default", async () => {
      const lc = new CoreLaconiaContext({});
      const factory = jest.fn().mockImplementation(() => ({ env: "bar" }));
      lc.registerFactory(factory);
      await lc.refresh();
      await lc.refresh();
      expect(lc).toHaveProperty("env", "bar");
      expect(factory).toHaveBeenCalledTimes(1);
    });

    xit("should have ttl", () => {});
  });
});
