const NullSpier = require("../src/NullSpier");

describe("NullSpier", () => {
  it("should do nothing when track is called", () => {
    const spier = new NullSpier();
    spier.track();
  });
});
