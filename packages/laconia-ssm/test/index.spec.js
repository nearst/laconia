const laconiaSsm = require("../src/index");

describe("laconia-ssm", () => {
  describe("#envVarInstances", () => {
    it("has envVarInstances function", () => {
      expect(laconiaSsm.envVarInstances).toBeFunction();
    });

    it("returns an empty instance when no env var is configured", async () => {
      const instances = await laconiaSsm.envVarInstances()({ env: {} });
      expect(instances).toBeEmpty();
    });
  });
});
