const LaconiaContext = require("../src/LaconiaContext");
const delay = require("delay");

describe("laconiaContext", () => {
  it("should be able to register new instance", () => {
    const lc = new LaconiaContext();
    lc.registerInstances({ foo: "bar" });
    expect(lc).toHaveProperty("foo", "bar");
    lc.registerInstances({ boo: "baz" });
    expect(lc).toHaveProperty("foo", "bar");
    expect(lc).toHaveProperty("boo", "baz");
  });

  it("should be able to override instance", () => {
    const lc = new LaconiaContext();
    lc.registerInstances({ env: "bar" });
    expect(lc).toHaveProperty("env", "bar");
  });

  it("should throw an error when the referenced dependency is not registered", async () => {
    const lc = new LaconiaContext();
    lc.registerInstances({ foo: "bar", fiz: "baz" });
    expect(() => lc.fooo).toThrow(
      "The dependency fooo is not available. Have you registered your dependency? These are the dependencies available in LaconiaContext: foo, fiz"
    );
  });

  it("should be able to stringify", () => {
    const lc = new LaconiaContext();
    lc.registerInstances({ env: "bar" });
    const result = JSON.parse(JSON.stringify(lc));
    expect(result).toHaveProperty("env", "bar");
  });

  describe("#registerFactory", () => {
    it("should be able to register sync factoryFn", async () => {
      const lc = new LaconiaContext();
      lc.registerFactory(() => ({ env: "bar" }));
      await lc.refresh();
      expect(lc).toHaveProperty("env", "bar");
    });

    it("should be able to register async factoryFn", async () => {
      const lc = new LaconiaContext();
      lc.registerFactory(async () => Promise.resolve({ env: "bar" }));
      await lc.refresh();
      expect(lc).toHaveProperty("env", "bar");
    });

    it("should be able to use instance created by prior factory", async () => {
      const lc = new LaconiaContext();
      lc.registerFactory(() => ({ env: "bar" }));
      lc.registerFactory(({ env }) => ({ newEnv: `${env}${env}` }));
      await lc.refresh();
      expect(lc).toHaveProperty("newEnv", "barbar");
    });

    it("should not run factoryFn if refresh is not called", async () => {
      const lc = new LaconiaContext();
      const factory = jest.fn();
      lc.registerFactory(factory);
      expect(factory).not.toBeCalled();
    });

    it("should always run factoryFn when refresh is called", async () => {
      const lc = new LaconiaContext();
      const factory = jest.fn().mockImplementation(() => ({}));
      lc.registerFactory(factory);
      await lc.refresh();
      await lc.refresh();
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe("#registerBuiltInInstances", () => {
    xit("should be able to access the registered instance via $", () => {
      const lc = new LaconiaContext();
      lc.registerBuiltInInstances({ foo: "bar" });
      expect(lc).toHaveProperty("foo", "bar");
      expect(lc).toHaveProperty("$foo", "bar");
    });
  });

  describe("#registerFactories", () => {
    it("should be able to register sync factoryFn", async () => {
      const lc = new LaconiaContext();
      lc.registerFactories([() => ({ foo: "boo" }), () => ({ bar: "baz" })]);
      await lc.refresh();
      expect(lc).toHaveProperty("foo", "boo");
      expect(lc).toHaveProperty("bar", "baz");
    });

    it(
      "should parallelize call to factoryFns which are registered together",
      async () => {
        const lc = new LaconiaContext();
        lc.registerFactories([
          () => delay(5).then(() => ({})),
          () => delay(5).then(() => ({})),
          () => delay(5).then(() => ({})),
          () => delay(5).then(() => ({})),
          () => delay(5).then(() => ({}))
        ]);
        await lc.refresh();
      },
      10
    );

    it("should be able to use instance created by prior factory", async () => {
      const lc = new LaconiaContext();
      lc.registerFactory(() => ({ env: 1 }));
      lc.registerFactories([
        ({ env }) => ({ foo: env + 1 }),
        ({ env }) => ({ bar: env + 2 })
      ]);
      await lc.refresh();
      expect(lc).toHaveProperty("foo", 2);
      expect(lc).toHaveProperty("bar", 3);
    });
  });

  describe("#registerPostProcessor", () => {
    describe("when there is one factory", () => {
      it("should be able register 1 post processor", async () => {
        const lc = new LaconiaContext();
        const postProcessor = jest.fn();

        lc.registerFactory(() => ({ foo: "bar" }));
        lc.registerPostProcessor(postProcessor);
        await lc.refresh();

        expect(postProcessor).toBeCalledWith({ foo: "bar" });
      });

      it("should be able to register multiple post processors", async () => {
        const lc = new LaconiaContext();
        const postProcessor1 = jest.fn();
        const postProcessor2 = jest.fn();

        lc.registerFactory(() => ({ foo: "bar" }));
        lc.registerPostProcessor(postProcessor1);
        lc.registerPostProcessor(postProcessor2);
        await lc.refresh();

        expect(postProcessor1).toBeCalledWith({ foo: "bar" });
        expect(postProcessor2).toBeCalledWith({ foo: "bar" });
      });

      it("should escalate postProcessor error", async () => {
        const lc = new LaconiaContext();
        const postProcessor = jest.fn().mockRejectedValue(new Error("error"));

        lc.registerFactory(() => ({ foo: "bar" }));
        lc.registerPostProcessor(postProcessor);
        await expect(lc.refresh()).rejects.toThrow("error");
      });
    });

    describe("when there are multiple factories", () => {
      it("should post process on every factory call", async () => {
        const lc = new LaconiaContext();
        const postProcessor = jest.fn();

        lc.registerFactory(() => ({ factory1: "factory1" }));
        lc.registerFactory(() => ({ factory2: "factory2" }));
        lc.registerPostProcessor(postProcessor);
        await lc.refresh();

        expect(postProcessor).toBeCalledTimes(2);
        expect(postProcessor).toBeCalledWith({ factory1: "factory1" });
        expect(postProcessor).toBeCalledWith({ factory2: "factory2" });
      });

      it("should be able to take post-processed value from second factory", async () => {
        const lc = new LaconiaContext();

        lc.registerFactory(() => ({ foo: { value: "bar" } }));
        lc.registerFactory(({ foo }) => ({ faz: foo.value }));
        lc.registerPostProcessor(async lc => {
          if (lc.foo) {
            lc.foo.value = `${lc.foo.value}-post-processed`;
          }
        });
        await lc.refresh();

        expect(lc).toHaveProperty("faz", "bar-post-processed");
      });
    });
  });
});
