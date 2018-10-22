const config = require("../src/index");

describe("@laconia/config", () => {
  describe("#envVarInstances", () => {
    it("has envVarInstances function", () => {
      expect(config.envVarInstances).toBeFunction();
    });

    it("returns an empty instance when no env var is configured", async () => {
      const instances = await config.envVarInstances()({ env: {} });
      expect(instances).toBeEmpty();
    });
  });
});
