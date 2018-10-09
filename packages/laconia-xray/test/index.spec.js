const xray = require("../src/index");

describe("laconia xray", () => {
  describe("#postProcessor", () => {
    it("has postProcessor function", () => {
      expect(xray.postProcessor).toBeFunction();
    });
  });
});
