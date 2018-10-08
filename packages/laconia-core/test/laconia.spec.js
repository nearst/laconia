const laconia = require("../src/laconia");

describe("laconia", () => {
  let callback;
  let handlerArgs;

  beforeEach(() => {
    callback = jest.fn();
    handlerArgs = [{ foo: "event" }, { fiz: "context" }, callback];
  });

  it("should call Lambda callback with null when there is no value returned", async () => {
    await laconia(() => {})(...handlerArgs);
    expect(callback).toBeCalledWith(null, undefined);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should delegate AWS parameters to handler function", async () => {
    const handler = jest.fn();
    await laconia(handler)(...handlerArgs);
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
      await laconia(handler)(...handlerArgs);
      expect(handler).not.toBeCalledWith(
        expect.objectContaining({ $run: true })
      );
    });
  });

  describe("#register", () => {
    describe("when registering a function", () => {
      it("should be able to add instances by calling 'register'", async () => {
        const handler = jest.fn();
        await laconia(handler)
          .register(lc => ({ foo: "bar" }))
          .register(lc => ({ boo: "baz" }))(...handlerArgs);

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
        })(...handlerArgs);

        expect(handler).toBeCalledWith(
          expect.objectContaining({
            foo: "bar"
          })
        );
      });

      it("should cache factory by default", async () => {
        const factory = jest.fn().mockImplementation(() => ({}));
        const handler = await laconia(jest.fn()).register(factory);
        await handler(...handlerArgs);
        await handler(...handlerArgs);

        expect(factory).toHaveBeenCalledTimes(1);
      });

      it("should be able to turn off caching", async () => {
        const factory = jest.fn().mockImplementation(() => ({}));
        const handler = await laconia(jest.fn()).register(factory, {
          cache: {
            enabled: false
          }
        });
        await handler(...handlerArgs);
        await handler(...handlerArgs);

        expect(factory).toHaveBeenCalledTimes(2);
      });
    });

    describe("when registering an array", () => {
      let factory1;
      let factory2;

      beforeEach(() => {
        factory1 = jest.fn().mockImplementation(() => ({ foo: "bar" }));
        factory2 = jest.fn().mockImplementation(() => ({ boo: "baz" }));
      });

      it("should be return instances created by the array of factoryFns", async () => {
        const handler = jest.fn();
        await laconia(handler).register([factory1, factory2])(...handlerArgs);

        expect(handler).toBeCalledWith(
          expect.objectContaining({
            foo: "bar",
            boo: "baz"
          })
        );
      });

      it("should cache all by default", async () => {
        const handler = await laconia(jest.fn()).register([factory1, factory2]);
        await handler(...handlerArgs);
        await handler(...handlerArgs);

        expect(factory1).toHaveBeenCalledTimes(1);
        expect(factory2).toHaveBeenCalledTimes(1);
      });

      it("should be able to turn off caching", async () => {
        const handler = await laconia(jest.fn()).register(
          [factory1, factory2],
          {
            cache: {
              enabled: false
            }
          }
        );
        await handler(...handlerArgs);
        await handler(...handlerArgs);

        expect(factory1).toHaveBeenCalledTimes(2);
        expect(factory2).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("#postProcessor", () => {
    it("should register post processor function", async () => {
      const handler = jest.fn();
      await laconia(handler)
        .register(() => ({ foo: { value: 1 } }))
        .postProcessor(({ foo }) => {
          foo.value = 2;
        })(...handlerArgs);

      expect(handler).toBeCalledWith(
        expect.objectContaining({
          foo: expect.objectContaining({ value: 2 })
        })
      );
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
