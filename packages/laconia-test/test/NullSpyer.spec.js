const NullSpyer = require("../src/NullSpyer");

describe("NullSpyer", () => {
  it("should do nothing when track is called", () => {
    const spyer = new NullSpyer();
    spyer.track();
  });
});
