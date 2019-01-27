const createEventAdapter = require("../src/createEventAdapter");

describe("craeteEventAdapter", () => {
  it("returns an adapter function", () => {
    const inputConverter = { convert: "bar" };
    const adapter = createEventAdapter(inputConverter)()();
    expect(adapter).toBeFunction();
  });

  it("is created with the specified inputConverter", () => {
    const inputConverter = { convert: "bar" };
    const adapter = createEventAdapter(inputConverter)({ functional: false })();
    expect(adapter.inputConverter).toEqual(inputConverter);
  });
});
