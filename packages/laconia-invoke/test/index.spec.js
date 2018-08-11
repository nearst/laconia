const laconiaInvoke = require("../src/index");

describe("laconia-invoke", () => {
  describe("#instances", () => {
    it("has instances function", () => {
      expect(laconiaInvoke.instances).toBeFunction();
    });

    it("returns an empty instance when no env var is configured", () => {
      const instances = laconiaInvoke.instances({ env: {} });
      expect(instances).toBeEmpty();
    });
  });
});
