/* eslint-env jest */

const lp = require("../src/index.js");

describe("laconia promise", () => {
  let callback;

  beforeEach(() => {
    callback = jest.fn();
  });

  it("should call Lambda callback with null when there is no value returned", () => {
    return lp(() => {})({}, {}, callback).then(_ => {
      expect(callback).toBeCalledWith(null, undefined);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  it("should delegate AWS parameters to handler function", () => {
    const handler = jest.fn();
    return lp(handler)({ foo: "bar" }, { fiz: "baz" }, callback).then(_ => {
      expect(handler).toBeCalledWith({ foo: "bar" }, { fiz: "baz" }, callback);
    });
  });

  describe("when synchronous code", () => {
    it("should call Lambda callback with the handler return value to Lambda callback", () => {
      return lp(() => "value")({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(null, "value");
      });
    });

    it("should call Lambda callback with the error thrown", () => {
      const error = new Error("boom");
      return lp(() => {
        throw error;
      })({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(error);
      });
    });
  });

  describe("when handling promise", () => {
    it("should call Lambda callback with the handler return value to Lambda callback", () => {
      return lp(() => Promise.resolve("value"))({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(null, "value");
      });
    });

    it("should call Lambda callback with the error thrown", () => {
      const error = new Error("boom");
      return lp(() => Promise.reject(error))({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(error);
      });
    });
  });
});
