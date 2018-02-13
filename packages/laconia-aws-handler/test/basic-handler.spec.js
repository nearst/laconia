/* eslint-env jest */

const laconiaHandler = require("../src/basic-handler");

describe("aws handler", () => {
  let callback;

  beforeEach(() => {
    callback = jest.fn();
  });

  it("should call Lambda callback with null when there is no value returned", async () => {
    await laconiaHandler(() => {})({}, {}, callback);
    expect(callback).toBeCalledWith(null, undefined);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should delegate AWS parameters to handler function", async () => {
    const handler = jest.fn();
    await laconiaHandler(handler)({ foo: "bar" }, { fiz: "baz" }, callback);
    expect(handler).toBeCalledWith({ foo: "bar" }, { fiz: "baz" }, callback);
  });

  describe("when synchronous code", () => {
    it("should call Lambda callback with the handler return value to Lambda callback", async () => {
      await laconiaHandler(() => "value")({}, {}, callback);
      expect(callback).toBeCalledWith(null, "value");
    });

    it("should call Lambda callback with the error thrown", async () => {
      const error = new Error("boom");
      await laconiaHandler(() => {
        throw error;
      })({}, {}, callback);
      expect(callback).toBeCalledWith(error);
    });
  });

  describe("when handling promise", () => {
    it("should call Lambda callback with the handler return value to Lambda callback", async () => {
      await laconiaHandler(() => Promise.resolve("value"))({}, {}, callback);
      expect(callback).toBeCalledWith(null, "value");
    });

    it("should call Lambda callback with the error thrown", async () => {
      const error = new Error("boom");
      await laconiaHandler(() => Promise.reject(error))({}, {}, callback);
      expect(callback).toBeCalledWith(error);
    });
  });
});
