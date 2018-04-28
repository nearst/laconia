const laconiaContext = require("../src/coreLaconiaContext");

describe("laconiaContext", () => {
  it("should include invoke function in laconiaContext", async () => {
    const result = laconiaContext({ foo: "event" }, { fiz: "context" });
    expect(result).toEqual(
      expect.objectContaining({ invoke: expect.any(Function) })
    );
  });

  it("should include recurse function in laconiaContext");

  it("should be able to run handler without executing Lambda logic");

  it("inject laconia-core provider as implementation");
});
