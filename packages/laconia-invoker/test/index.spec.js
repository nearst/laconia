const laconiaInvoker = require("../src/index");

describe("laconia-invoker", () => {
  describe("#envVarInstances", () => {
    it("has instances function", () => {
      expect(laconiaInvoker.envVarInstances).toBeFunction();
    });

    it("returns an empty instance when no env var is configured", async () => {
      const instances = await laconiaInvoker.envVarInstances()({ env: {} });
      expect(instances).toBeEmpty();
    });
  });
});
