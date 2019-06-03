const createWebSocketAdapter = require("../src/createWebSocketAdapter");
const { apigateway } = require("@laconia/event");

describe("createWebSocketAdapter", () => {
  it("returns an adapter function", () => {
    const adapter = createWebSocketAdapter()();
    expect(adapter).toBeFunction();
  });

  it("passes to app correctly", async () => {
    const app = jest.fn(x => x);
    const adapter = createWebSocketAdapter();
    const adapted = adapter(app);
    const event = {
      body: JSON.stringify({ foo: "bar" }),
      requestConext: { a: "b" }
    };
    await adapted(event);
    expect(app.mock.results[0].value).toEqual({ body: { foo: "bar" } });
  });

  it("passes laconia context", async () => {
    const app = jest.fn((e, ctx) => ctx);
    const adapter = createWebSocketAdapter();
    const adapted = adapter(app);
    const event = {
      body: JSON.stringify({ foo: "bar" }),
      requestConext: { a: "b" }
    };
    const context = {
      foo: "bar"
    };
    await adapted(event, context);
    expect(app.mock.results[0].value).toEqual(context);
  });

  it("handles app error correctly", async () => {
    const app = jest.fn(x => {
      throw new Error("error");
    });
    const adapter = createWebSocketAdapter();
    const adapted = adapter(app);
    const event = {
      body: JSON.stringify({ foo: "bar" }),
      requestConext: { a: "b" }
    };
    const result = await adapted(event);
    const expected = apigateway.res("error", 500, {
      "Content-Type": "text/plain"
    });
    expect(result).toEqual(expected);
  });
});
