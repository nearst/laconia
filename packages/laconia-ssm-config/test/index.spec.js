const laconiaSsmConfig = require("../src/index");

describe("laconia-ssm", () => {
  describe("#envVarInstances", () => {
    it("has envVarInstances function", () => {
      expect(laconiaSsmConfig.envVarInstances).toBeFunction();
    });

    it("returns an empty instance when no env var is configured", async () => {
      const instances = await laconiaSsmConfig.envVarInstances()({ env: {} });
      expect(instances).toBeEmpty();
    });
  });
});
