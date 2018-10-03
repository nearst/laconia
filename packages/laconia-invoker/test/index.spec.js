const AWS = require("aws-sdk");
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

    it("should be able to override lambda", async () => {
      const lambda = new AWS.Lambda();
      const instances = await laconiaInvoker.envVarInstances()({
        env: { LACONIA_INVOKER_MY_FUNC: "func" },
        $lambda: lambda
      });
      const invoker = instances.myFunc;
      expect(invoker.lambda).toBe(lambda);
    });
  });
});
