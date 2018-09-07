const delay = require("delay");
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
    let lc;
    let factory;

    beforeEach(() => {
      lc = new CoreLaconiaContext({ one: 1 });
      factory = jest.fn().mockImplementation(() => ({ env: "bar" }));
    });

    it("should cache by default", async () => {
      lc.registerFactory(factory);
      await lc.refresh();
      await lc.refresh();
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it("should be able to turn off cache", async () => {
      lc.registerFactory(factory, { enabled: false });
      await lc.refresh();
      await lc.refresh();
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it("should expire cache based on maxAge option", async () => {
      lc.registerFactory(factory, { maxAge: 1 });
      await lc.refresh();
      await delay(5);
      await lc.refresh();
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it("should be able to access lc in cached factory", async () => {
      lc.registerFactory(({ one }) => ({ two: one + 1 }));
      await lc.refresh();
      expect(lc.two).toEqual(2);
    });
  });
});
