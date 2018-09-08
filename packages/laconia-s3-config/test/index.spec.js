const laconiaS3Config = require("../src/index");

describe("laconia-ssm", () => {
  describe("#envVarInstances", () => {
    it("has envVarInstances function", () => {
      expect(laconiaS3Config.envVarInstances).toBeFunction();
    });

    it("returns an empty instance when no env var is configured", async () => {
      const instances = await laconiaS3Config.envVarInstances()({ env: {} });
      expect(instances).toBeEmpty();
    });
  });
});
