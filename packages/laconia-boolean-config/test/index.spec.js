const booleanConfig = require("../src/index");

describe("@laconia/boolean-config", () => {
  describe("#envVarInstances", () => {
    it("has envVarInstances function", () => {
      expect(booleanConfig.envVarInstances).toBeFunction();
    });

    it("returns an empty instance when no env var is configured", async () => {
      const instances = await booleanConfig.envVarInstances()({ env: {} });
      expect(instances).toBeEmpty();
    });
  });
});
