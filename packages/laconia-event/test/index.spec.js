const config = require("../src/index");

describe("@laconia/event", () => {
  describe("#s3", () => {
    it("has s3 function", () => {
      expect(config.s3).toBeFunction();
    });
  });
});
