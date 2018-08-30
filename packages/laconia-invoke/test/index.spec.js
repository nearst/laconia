const laconiaInvoke = require("../src/index");

describe("laconia-invoke", () => {
  describe("#envVarInstances", () => {
    it("has instances function", () => {
      expect(laconiaInvoke.envVarInstances).toBeFunction();
    });

    it("returns an empty instance when no env var is configured", async () => {
      const instances = await laconiaInvoke.envVarInstances({ env: {} });
      expect(instances).toBeEmpty();
    });
  });
});
