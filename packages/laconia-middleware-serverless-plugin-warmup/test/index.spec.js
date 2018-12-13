const middlewareServerlessPluginWarmup = require("../src/index");

describe("middleware-serverless-plugin-warmup", () => {
  const event = {};
  const callback = jest.fn();
  let context;
  let next;
  let middleware;

  beforeEach(() => {
    next = jest.fn();
    middleware = middlewareServerlessPluginWarmup();
    context = {};
  });

  describe("when context.custom.source returns 'serverless-plugin-warmup'", () => {
    beforeEach(() => {
      context = {
        custom: {
          source: "serverless-plugin-warmup"
        }
      };
    });

    it("should not call next", async () => {
      await middleware(next)(event, context, callback);

      expect(next).not.toBeCalled();
    });

    it('should return "Lambda is warm!"', async () => {
      const result = await middleware(next)(event, context, callback);

      expect(result).toEqual("Lambda is warm!");
    });
  });

  describe("when Lambda is not invoked by serverless-plugin-warmup", () => {
    it("should call next", async () => {
      await middleware(next)(event, context, callback);

      expect(next).toBeCalledWith(event, context, callback);
    });

    it("should return next returned value", async () => {
      next.mockResolvedValue("value");

      const result = await middleware(next)(event, context, callback);

      expect(result).toEqual("value");
    });
  });
});
