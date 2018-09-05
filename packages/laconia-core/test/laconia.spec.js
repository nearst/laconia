const laconia = require("../src/laconia");

describe("handler", () => {
  let callback;

  beforeEach(() => {
    callback = jest.fn();
  });

  it("should call Lambda callback with null when there is no value returned", async () => {
    await laconia(() => {})({}, {}, callback);
    expect(callback).toBeCalledWith(null, undefined);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should delegate AWS parameters to handler function", async () => {
    const handler = jest.fn();
    await laconia(handler)({ foo: "event" }, { fiz: "context" }, callback);
    expect(handler).toBeCalledWith(
      expect.objectContaining({
        event: { foo: "event" },
        context: { fiz: "context" }
      })
    );
  });

  it("should be able to run handler without executing Lambda logic", () => {
    const handler = jest.fn();
    laconia(handler).run({ foo: "bar" });
    expect(handler).toBeCalledWith(expect.objectContaining({ foo: "bar" }));
  });

  describe("run flag", () => {
    it("should set a flag when #run is called", () => {
      const handler = jest.fn();
      laconia(handler).run({});
      expect(handler).toBeCalledWith(expect.objectContaining({ $run: true }));
    });

    it("should not set a flag when the handler is being called normally", async () => {
      const handler = jest.fn();
      await laconia(handler)({ foo: "event" }, { fiz: "context" }, callback);
      expect(handler).not.toBeCalledWith(
        expect.objectContaining({ $run: true })
      );
    });
  });

  describe("#register", () => {
    it("should be able to add instances by calling 'register'", async () => {
      const handler = jest.fn();
      await laconia(handler)
        .register(lc => ({ foo: "bar" }))
        .register(lc => ({ boo: "baz" }))(
        { foo: "event" },
        { fiz: "context" },
        callback
      );

      expect(handler).toBeCalledWith(
        expect.objectContaining({
          foo: "bar",
          boo: "baz"
        })
      );
    });

    it("should be able to add async instances by calling 'register'", async () => {
      const handler = jest.fn();
      await laconia(handler).register(async lc => {
        return Promise.resolve({ foo: "bar" });
      })({ foo: "event" }, { fiz: "context" }, callback);

      expect(handler).toBeCalledWith(
        expect.objectContaining({
          foo: "bar"
        })
      );
    });

    it("should cache factoryfn by default", async () => {
      const factoryFn = jest.fn().mockImplementation(() => ({}));
      const handler = await laconia(jest.fn()).register(factoryFn);
      await handler({ foo: "event" }, { fiz: "context" }, callback);
      await handler({ foo: "event" }, { fiz: "context" }, callback);

      expect(factoryFn).toHaveBeenCalledTimes(1);
    });

    it("should be able to turn off caching", async () => {
      const factoryFn = jest.fn().mockImplementation(() => ({}));
      const handler = await laconia(jest.fn()).register(factoryFn, {
        cache: {
          enabled: false
        }
      });
      await handler({ foo: "event" }, { fiz: "context" }, callback);
      await handler({ foo: "event" }, { fiz: "context" }, callback);

      expect(factoryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("callback behaviour", () => {
    describe("when synchronous code is returned", () => {
      it("should call Lambda callback with the handler return value to Lambda callback", async () => {
        await laconia(() => "value")({}, {}, callback);
        expect(callback).toBeCalledWith(null, "value");
      });

      it("should call Lambda callback with the error thrown", async () => {
        const error = new Error("boom");
        await laconia(() => {
          throw error;
        })({}, {}, callback);
        expect(callback).toBeCalledWith(error);
      });
    });

    describe("when promise is returned", () => {
      it("should call Lambda callback with the handler return value to Lambda callback", async () => {
        await laconia(() => Promise.resolve("value"))({}, {}, callback);
        expect(callback).toBeCalledWith(null, "value");
      });

      it("should call Lambda callback with the error thrown", async () => {
        const error = new Error("boom");
        await laconia(() => Promise.reject(error))({}, {}, callback);
        expect(callback).toBeCalledWith(error);
      });
    });
  });
});
