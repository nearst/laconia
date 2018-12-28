const lambdaWarmer = require("lambda-warmer");
const middlewareLambdaWarmer = require("../src/index");

jest.mock("lambda-warmer");

describe("middleware-lambda-warmer", () => {
  const event = {};
  const context = {};
  const callback = jest.fn();
  let next;
  let middleware;

  beforeEach(() => {
    next = jest.fn();
    lambdaWarmer.mockReset();
    middleware = middlewareLambdaWarmer();
  });

  describe("when warmer returns false", () => {
    beforeEach(() => {
      lambdaWarmer.mockResolvedValue(false);
    });

    it("should call next", async () => {
      await middleware(next)(event, context, callback);

      expect(next).toBeCalledWith(event, context, callback);
    });

    it("should call warmer with the specified event", async () => {
      await middleware(next)(event, context, callback);

      expect(lambdaWarmer).toBeCalledWith(event);
    });

    it("should return next returned value", async () => {
      next.mockResolvedValue("value");

      const result = await middleware(next)(event, context, callback);

      expect(result).toEqual("value");
    });
  });

  describe("when warmer returns true", () => {
    beforeEach(() => {
      lambdaWarmer.mockResolvedValue(true);
    });

    it("should not call next", async () => {
      await middleware(next)(event, context, callback);

      expect(next).not.toBeCalled();
    });

    it('should return "warmed"', async () => {
      const result = await middleware(next)(event, context, callback);

      expect(result).toEqual("warmed");
    });
  });
});
