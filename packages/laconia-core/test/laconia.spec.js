const laconia = require("../src/laconia");
const AWS = require("aws-sdk");

describe("laconia", () => {
  let handlerArgs;
  let event;

  beforeEach(() => {
    event = { foo: "event" };
    handlerArgs = [event, { fiz: "context" }];
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

  it("should return value from app function", async () => {
    const result = await laconia(() => {})(...handlerArgs);
    expect(result).toBeUndefined();
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

      it("should throw an error when the required dependency is not available", async () => {
        const handler = laconia((event, { fooo }) => {}).register(lc => ({
          foo: "bar"
        }));

        await expect(handler(...handlerArgs)).rejects.toThrowError(
          /The dependency fooo is not available./
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

      it("should throw an error when the factory is not a function", async () => {
        expect(() => laconia(jest.fn()).register({ foo: "bar" })).toThrow(
          new TypeError(
            'register() expects to be passed a function, you passed: {"foo":"bar"}'
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
      it("should not call Lambda callback", async () => {
        const callback = jest.fn();
        const res = await laconia(() => "value")({}, {}, callback);
        expect(res).toBe("value");
        expect(callback).not.toHaveBeenCalled();
      });

      it("should throw error", async () => {
        const error = new Error("boom");
        await expect(
          laconia(() => {
            throw error;
          })({}, {})
        ).rejects.toThrowError(error);
      });
    });

    describe("when promise is returned", () => {
      it("should call resolve value", async () => {
        const res = await laconia(() => Promise.resolve("value"))({}, {});
        expect(res).toBe("value");
      });

      it("should call Lambda callback with the error thrown", async () => {
        const error = new Error("boom");
        await expect(
          laconia(() => Promise.reject(error))({}, {})
        ).rejects.toThrowError(error);
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
