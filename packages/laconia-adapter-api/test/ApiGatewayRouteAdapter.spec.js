const ApiGatewayRouteAdapter = require("../src/ApiGatewayRouteAdapter");

describe("ApiGatewayRouteAdapter", () => {
  let event;
  let routeMappings;
  let constructorArgs;
  let laconiaContext;

  beforeEach(() => {
    const firstApp = jest.fn();
    const secondApp = jest.fn();
    const thirdApp = jest.fn();

    firstApp.mockResolvedValue({ status: "first" });
    secondApp.mockResolvedValue({ status: "second" });
    thirdApp.mockResolvedValue({ status: "third" });

    routeMappings = {
      "/example/path": firstApp,
      "/example/asterisk/*": secondApp,
      "no/initial/slash": thirdApp
    };
    constructorArgs = [routeMappings];
    laconiaContext = { laconia: "context" };
  });

  it("should call the app corresponding to the exact path", async () => {
    event = {
      foo: "event",
      path: "/example/path"
    };

    const adapter = new ApiGatewayRouteAdapter(...constructorArgs);
    const result = await adapter.handle(event, laconiaContext);

    expect(result).toEqual(expect.objectContaining({ status: "first" }));
  });

  it("should call the app corresponding to the path with an asterisk", async () => {
    event = {
      foo: "event",
      path: "/example/asterisk/123456"
    };

    const adapter = new ApiGatewayRouteAdapter(...constructorArgs);
    const result = await adapter.handle(event, laconiaContext);

    expect(result).toEqual(expect.objectContaining({ status: "second" }));
  });

  it("should call the app corresponding to the path with a missing initial forward slash", async () => {
    event = {
      foo: "event",
      path: "/no/initial/slash"
    };

    const adapter = new ApiGatewayRouteAdapter(...constructorArgs);
    const result = await adapter.handle(event, laconiaContext);

    expect(result).toEqual(expect.objectContaining({ status: "third" }));
  });

  it("should return a 404 if no path is found", async () => {
    event = {
      foo: "event",
      path: "/fake/path"
    };

    const adapter = new ApiGatewayRouteAdapter(...constructorArgs);
    const result = await adapter.handle(event, laconiaContext);

    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 404,
        body: "{}",
        isBase64Encoded: false,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      })
    );
  });
});
