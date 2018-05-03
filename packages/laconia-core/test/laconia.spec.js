const laconia = require("../src/laconia");
const LaconiaContext = require("../src/LaconiaContext");

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

  it("should fire init lifecycle", async () => {
    const handler = jest.fn();
    const initListener = jest.fn();
    await laconia(handler).on("init", initListener)(
      { foo: "event" },
      { fiz: "context" },
      callback
    );

    expect(initListener).toHaveBeenCalledWith(expect.any(LaconiaContext));
  });

  it("should be able to configure laconiaContext in init lifecycle", async () => {
    const handler = jest.fn();
    await laconia(handler)
      .on("init", lc => lc.register({ foo: "bar" }))
      .on("init", lc => lc.register({ boo: "baz" }))(
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

  it("should be able to async configure laconiaContext in init lifecycle", async () => {
    const handler = jest.fn();
    await laconia(handler).on("init", async lc => {
      const instance = await Promise.resolve({ foo: "bar" });
      lc.register(instance);
    })({ foo: "event" }, { fiz: "context" }, callback);

    expect(handler).toBeCalledWith(
      expect.objectContaining({
        foo: "bar"
      })
    );
  });

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
