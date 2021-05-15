const createRouteAdapter = require("../src/createRouteAdapter");

describe("createRouteAdapter", () => {
  it("returns an adapter function", () => {
    const adapter = createRouteAdapter();

    expect(adapter).toBeFunction();
  });

  it("is created with given mappings", () => {
    const app = jest.fn();

    const adapter = createRouteAdapter({
      mappings: { "example/path": app },
      functional: false
    });

    expect(adapter.routeMappings).toEqual({
      "example/path": app
    });
  });
});
