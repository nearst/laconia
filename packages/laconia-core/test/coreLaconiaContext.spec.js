const laconiaContext = require("../src/coreLaconiaContext");
const invoke = require("../src/invoke");

describe("laconiaContext", () => {
  it("should include invoke function", () => {
    const lc = laconiaContext({});
    expect(lc).toEqual(expect.objectContaining({ invoke }));
  });

  it("should include instantiated recurse function", () => {
    const lc = laconiaContext({});
    expect(lc).toEqual(
      expect.objectContaining({ recurse: expect.any(Function) })
    );
  });

  it("should include process.env", () => {
    const lc = laconiaContext({});
    expect(lc).toEqual(expect.objectContaining({ env: process.env }));
  });

  it("should be able to inject new member", () => {
    const lc = laconiaContext({});
    lc.inject({ foo: "bar" });
    expect(lc).toEqual(expect.objectContaining({ foo: "bar" }));
    lc.inject({ boo: "baz" });
    expect(lc).toEqual(expect.objectContaining({ foo: "bar" }));
    expect(lc).toEqual(expect.objectContaining({ boo: "baz" }));
  });

  it("should be able to override member", () => {
    const lc = laconiaContext({});
    lc.inject({ env: "bar" });
    expect(lc).toEqual(expect.objectContaining({ env: "bar" }));
  });

  it("should make built-in members available after being overridden", () => {
    const lc = laconiaContext({});
    lc.inject({ env: "bar" });
    expect(lc).toEqual(expect.objectContaining({ $env: process.env }));
  });
});
