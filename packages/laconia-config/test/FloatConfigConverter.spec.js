const FloatConfigConverter = require("../src/FloatConfigConverter");

describe("FloatConfigConverter", () => {
  describe("when there is one env var set", () => {
    let configConverter;

    it("converts a float value to a float", async () => {
      configConverter = new FloatConfigConverter();
      const instances = await configConverter.convertMultiple({
        tax: "80.80"
      });
      expect(instances).toHaveProperty("tax", 80.8);
    });
  });

  describe("when there is multiple env vars set", () => {
    it("should return multiple instances", async () => {
      const configConverter = new FloatConfigConverter();
      const floats = await configConverter.convertMultiple({
        taxRate: "80.80",
        splitTest: "0.56"
      });
      expect(floats).toHaveProperty("taxRate", 80.8);
      expect(floats).toHaveProperty("splitTest", 0.56);
    });
  });
});
