const laconiaContext = require("../src/coreLaconiaContext");
const invoke = require("../src/invoke");

describe("laconiaContext", () => {
  it("should include invoke function", () => {
    const result = laconiaContext({ foo: "event" }, { fiz: "context" });
    expect(result).toEqual(expect.objectContaining({ invoke }));
  });

  it("should include instantiated recurse function", () => {
    const result = laconiaContext({ foo: "event" }, { fiz: "context" });
    expect(result).toEqual(
      expect.objectContaining({ recurse: expect.any(Function) })
    );
  });

  it("should include process.env", () => {
    const result = laconiaContext({ foo: "event" }, { fiz: "context" });
    expect(result).toEqual(expect.objectContaining({ env: process.env }));
  });
});
