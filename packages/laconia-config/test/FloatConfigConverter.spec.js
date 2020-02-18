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

    it("returns NaN when not a float", async () => {
      configConverter = new FloatConfigConverter();
      const instances = await configConverter.convertMultiple({
        tax: "someString"
      });
      expect(instances).toHaveProperty("tax", NaN);
    });
  });

  describe("when there is multiple env vars set", () => {
    it("should return multiple instances", async () => {
      const configConverter = new FloatConfigConverter();
      const floats = await configConverter.convertMultiple({
        taxRate: "80.80",
        splitTest: "0.56",
        nonFloat: "not a float"
      });
      expect(floats).toHaveProperty("taxRate", 80.8);
      expect(floats).toHaveProperty("splitTest", 0.56);
      expect(floats).toHaveProperty("nonFloat", NaN);
    });
  });
});
