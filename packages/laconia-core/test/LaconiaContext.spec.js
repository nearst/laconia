const LaconiaContext = require("../src/LaconiaContext");

describe("laconiaContext", () => {
  it("should be able to register new instance", () => {
    const lc = new LaconiaContext({});
    lc.registerInstances({ foo: "bar" });
    expect(lc).toHaveProperty("foo", "bar");
    lc.registerInstances({ boo: "baz" });
    expect(lc).toHaveProperty("foo", "bar");
    expect(lc).toHaveProperty("boo", "baz");
  });

  it("should be able to override instance", () => {
    const lc = new LaconiaContext({});
    lc.registerInstances({ env: "bar" });
    expect(lc).toHaveProperty("env", "bar");
  });

  describe("#registerFactory", () => {
    it("should be able to register sync factoryFn", async () => {
      const lc = new LaconiaContext({});
      lc.registerFactory(() => ({ env: "bar" }));
      await lc.refresh();
      expect(lc).toHaveProperty("env", "bar");
    });

    it("should be able to register async factoryFn", async () => {
      const lc = new LaconiaContext({});
      lc.registerFactory(async () => Promise.resolve({ env: "bar" }));
      await lc.refresh();
      expect(lc).toHaveProperty("env", "bar");
    });

    it("should be able to use instance created by prior factory", async () => {
      const lc = new LaconiaContext({});
      lc.registerFactory(() => ({ env: "bar" }));
      lc.registerFactory(({ env }) => ({ newEnv: `${env}${env}` }));
      await lc.refresh();
      expect(lc).toHaveProperty("newEnv", "barbar");
    });

    it("should not run factoryFn if refresh is not called", async () => {
      const lc = new LaconiaContext({});
      const factory = jest.fn();
      lc.registerFactory(factory);
      expect(factory).not.toBeCalled();
    });

    it("should always run factoryFn when refresh is called", async () => {
      const lc = new LaconiaContext({});
      const factory = jest.fn().mockImplementation(() => ({}));
      lc.registerFactory(factory);
      await lc.refresh();
      await lc.refresh();
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });
});
