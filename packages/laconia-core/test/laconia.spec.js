const laconia = require("../src/laconia");
const AWS = require("aws-sdk");

describe("laconia", () => {
  let callback;
  let handlerArgs;
  let event;

  beforeEach(() => {
    callback = jest.fn();
    event = { foo: "event" };
    handlerArgs = [event, { fiz: "context" }, callback];
  });

  it("should throw an error when a handler is not specified", async () => {
    expect(() => laconia()).toThrow(
      new TypeError(
        "laconia() expects to be passed a function, you passed: undefined"
      )
    );
  });

  it("should throw an error when the handler specified is not a function", async () => {
    expect(() => laconia("my string")).toThrow(
      new TypeError(
        'laconia() expects to be passed a function, you passed: "my string"'
      )
    );
  });

  it("should call Lambda callback with null when there is no value returned", async () => {
    await laconia(() => {})(...handlerArgs);
    expect(callback).toBeCalledWith(null, undefined);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should delegate AWS parameters to app", async () => {
    const app = jest.fn();
    await laconia(app)(...handlerArgs);
    expect(app).toBeCalledWith(
      { foo: "event" },
      expect.objectContaining({
        context: { fiz: "context" }
      })
    );
  });

  describe("#register", () => {
    describe("when registering a single factory", () => {
      it("should be able to add instances by calling 'register'", async () => {
        const app = jest.fn();
        await laconia(app)
          .register(lc => ({ foo: "bar" }))
          .register(lc => ({ boo: "baz" }))(...handlerArgs);

        expect(app).toBeCalledWith(
          expect.any(Object),
          expect.objectContaining({
            foo: "bar",
            boo: "baz"
          })
        );
      });

      it("should be able to add instances by calling 'register' with a string", async () => {
        const app = jest.fn();
        await laconia(app)
          .register("foo", lc => "bar")
          .register("boo", lc => "baz")(...handlerArgs);

        expect(app).toBeCalledWith(
          expect.any(Object),
          expect.objectContaining({
            foo: "bar",
            boo: "baz"
          })
        );
      });

      it("should throw an error when the required dependency is not available", async () => {
        const handler = laconia((event, { fooo }) => {}).register(lc => ({
          foo: "bar"
        }));

        await handler(...handlerArgs);
        const errorMessage = callback.mock.calls[0][0].message;
        expect(errorMessage).toEqual(
          expect.stringMatching(/The dependency fooo is not available./)
        );
      });

      it("should be able to add async instances by calling 'register'", async () => {
        const app = jest.fn();
        await laconia(app).register(async lc => {
          return Promise.resolve({ foo: "bar" });
        })(...handlerArgs);

        expect(app).toBeCalledWith(
          expect.any(Object),
          expect.objectContaining({
            foo: "bar"
          })
        );
      });

      it("should be able to add async instances by calling 'register' with a string", async () => {
        const app = jest.fn();
        await laconia(app).register("foo", async lc => "bar")(...handlerArgs);

        expect(app).toBeCalledWith(
          expect.any(Object),
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

      it("should cache factory by default with a string", async () => {
        const factory = jest.fn().mockImplementation(() => ({}));
        const handler = await laconia(jest.fn()).register(
          "someFactory",
          factory
        );
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

      it("should be able to turn off caching with a string", async () => {
        const factory = jest.fn().mockImplementation(() => ({}));
        const handler = await laconia(jest.fn()).register(
          "someFactory",
          factory,
          {
            cache: {
              enabled: false
            }
          }
        );
        await handler(...handlerArgs);
        await handler(...handlerArgs);

        expect(factory).toHaveBeenCalledTimes(2);
      });

      it("should throw an error when the factory is not a function", async () => {
        expect(() => laconia(jest.fn()).register({ foo: "bar" })).toThrow(
          new TypeError(
            'register() expects to be passed a function, you passed: {"foo":"bar"}'
          )
        );
      });

      it("should throw an error when the factory is not a function with a string", async () => {
        expect(() => laconia(jest.fn()).register("foo", "bar")).toThrow(
          new TypeError(
            'register() expects to be passed a function, you passed: "bar"'
          )
        );
      });
    });

    describe("when registering an array", () => {
      let factory1;
      let factory2;

      beforeEach(() => {
        factory1 = jest.fn().mockImplementation(() => ({ foo: "bar" }));
        factory2 = jest.fn().mockImplementation(() => ({ boo: "baz" }));
      });

      it("should return instances created by the array of factoryFns", async () => {
        const app = jest.fn();
        await laconia(app).register([factory1, factory2])(...handlerArgs);

        expect(app).toBeCalledWith(
          expect.any(Object),
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

      it("should throw an error when the factory is not a function", async () => {
        expect(() => laconia(jest.fn()).register([{ foo: "bar" }])).toThrow(
          new TypeError(
            'register() expects to be passed a function, you passed: {"foo":"bar"}'
          )
        );
      });
    });
  });

  describe("#postProcessor", () => {
    it("should register post processor function", async () => {
      const app = jest.fn();
      await laconia(app)
        .register(() => ({ foo: { value: 1 } }))
        .postProcessor(async ({ foo }) => {
          if (foo) {
            foo.value = 2;
          }
        })(...handlerArgs);

      expect(app).toBeCalledWith(
        expect.any(Object),
        expect.objectContaining({
          foo: expect.objectContaining({ value: 2 })
        })
      );
    });

    it("should throw an error when postProcessor is not a function", async () => {
      expect(() => laconia(jest.fn()).postProcessor({ foo: "bar" })).toThrow(
        new TypeError(
          'postProcessor() expects to be passed a function, you passed: {"foo":"bar"}'
        )
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

  describe("Built-in instances", () => {
    it("should include AWS service objects", async () => {
      const app = jest.fn();
      await laconia(app)(...handlerArgs);

      const lc = app.mock.calls[0][1];
      expect(lc.$s3).toBeInstanceOf(AWS.S3);
      expect(lc.$lambda).toBeInstanceOf(AWS.Lambda);
      expect(lc.$ssm).toBeInstanceOf(AWS.SSM);
      expect(lc.$sns).toBeInstanceOf(AWS.SNS);
    });
  });
});
