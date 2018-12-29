const laconiaApi = require("../src/laconiaApi");
const createEvent = require("aws-event-mocks");

const createApiGatewayEvent = body =>
  createEvent({
    template: "aws:apiGateway",
    merge: {
      body: JSON.stringify(body),
      path: "search",
      requestContext: {
        resourcePath: "search"
      },
      queryStringParameters: {
        q: "input"
      },
      headers: {
        Authorization: "secret"
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

  it("should return the returned result", async () => {
    const handler = () => {
      return { status: "ok" };
    };
    await laconiaApi(handler)(...handlerArgs);
    expect(callback).toBeCalledWith(
      null,
      expect.objectContaining({
        body: '{"status":"ok"}',
        headers: { "content-type": "application/json" },
        statusCode: 200
      })
    );
  });

  it("should call handler with req", async () => {
    const handler = jest.fn();
    await laconiaApi(handler)(...handlerArgs);
    expect(handler).toBeCalledWith(
      {
        req: expect.objectContaining({
          query: {
            q: "input"
          },
          headers: expect.objectContaining({
            authorization: "secret"
          }),
          body: { foo: "event" }
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
    createEvent({
      template: "aws:apiGateway",
      merge: {
        path: "order/5/accept",
        requestContext: {
          resourcePath: "order/{orderId}/accept"
        },
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

  it("throw an error when requestContext is not available", async () => {
    createEvent({
      template: "aws:apiGateway",
      merge: {
        requestContext: null
      }
    });
    const handler = jest.fn();
    await laconiaApi(handler)(...handlerArgs);
    expect(callback).toBeCalledWith(
      new Error(
        "requestContext is not available in the event object. Laconia API only supports Lambda Proxy Integration."
      )
    );
  });
});
