const laconiaApi = require("../src/laconiaApi");
const createEvent = require("aws-event-mocks");

const createApiGatewayEvent = body =>
  createEvent({
    template: "aws:apiGateway",
    merge: {
      body: JSON.stringify(body),
      path: "search",
      resourcePath: "search",
      queryStringParameters: {
        q: "input"
      }
    }
  });

describe("laconiaApi", () => {
  let callback;
  let handlerArgs;
  let event;

  beforeEach(() => {
    callback = jest.fn();
    event = createApiGatewayEvent({ foo: "event" });
    handlerArgs = [event, { fiz: "context" }, callback];
  });

  xit("should return the returned result", async () => {
    const handler = ({ res }) => {
      return res.status(202).send({ status: "ok" });
    };
    const result = await laconiaApi(handler)(...handlerArgs);
    expect(result).toEqual({});
  });

  it("should inject req and res object when being called", async () => {
    const handler = jest.fn();
    await laconiaApi(handler)(...handlerArgs);
    expect(handler).toBeCalledWith(
      {
        req: expect.objectContaining({
          query: {
            q: "input"
          }
        }),
        res: expect.objectContaining({
          send: expect.any(Function)
        })
      },
      expect.any(Object)
    );
  });

  it("should delegate AWS parameters to handler function", async () => {
    const handler = jest.fn();
    await laconiaApi(handler)(...handlerArgs);
    expect(handler).toBeCalledWith(
      expect.any(Object),
      expect.objectContaining({
        context: { fiz: "context" }
      })
    );
  });

  it("should be able to parse one path parameter", async () => {
    event = createEvent({
      template: "aws:apiGateway",
      merge: {
        path: "order/5/accept",
        resourcePath: "order/{orderId}/accept",
        pathParameters: {
          orderId: "5"
        }
      }
    });
    const handler = jest.fn();
    await laconiaApi(handler)(...handlerArgs);
    expect(handler).toBeCalledWith(
      expect.objectContaining({
        req: expect.objectContaining({
          pathParameters: {
            orderId: "5"
          },
          params: {
            orderId: "5"
          }
        })
      }),
      expect.any(Object)
    );
  });

  it("should be able to parse multiple path parameters", async () => {
    event = createEvent({
      template: "aws:apiGateway",
      merge: {
        path: "order/5/accept/myparam",
        resourcePath: "order/{orderId}/accept/{someOtherParam}"
      }
    });
    const handler = jest.fn();
    await laconiaApi(handler)(...handlerArgs);
    expect(handler).toBeCalledWith(
      expect.objectContaining({
        req: expect.objectContaining({
          params: {
            orderId: "5",
            someOtherParam: "myparam"
          }
        })
      }),
      expect.any(Object)
    );
  });
});
