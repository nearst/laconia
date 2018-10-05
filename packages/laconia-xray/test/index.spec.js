const xray = require("../src/index");

describe("laconia xray", () => {
  describe("#awsInstances", () => {
    it("has awsInstances function", () => {
      expect(xray.awsInstances).toBeFunction();
    });

    it("returns lambda instance", async () => {
      const instances = xray.awsInstances()();
      expect(instances).toHaveProperty("$lambda");
    });
  });
});
