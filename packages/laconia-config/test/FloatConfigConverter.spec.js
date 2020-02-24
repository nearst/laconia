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

    it("throws an error when value is not a float", async () => {
      configConverter = new FloatConfigConverter();
      await expect(() =>
        configConverter.convertMultiple({
          tax: "foo"
        })
      ).toThrow(`Passed config:float "tax" = "foo" is not a valid float.`);
    });

    it("throws an error when value is an empty string", async () => {
      configConverter = new FloatConfigConverter();
      await expect(() =>
        configConverter.convertMultiple({
          tax: ""
        })
      ).toThrow(`Passed config:float "tax" = "" is not a valid float.`);
    });

    it("throws an error when value has invalid characters", async () => {
      configConverter = new FloatConfigConverter();
      await expect(() =>
        configConverter.convertMultiple({
          retryRate: "0.43b"
        })
      ).toThrow(
        `Passed config:float "retryRate" = "0.43b" is not a valid float.`
      );
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

    it("throws an error when one value is not a float", async () => {
      const configConverter = new FloatConfigConverter();
      await expect(() =>
        configConverter.convertMultiple({
          taxRate: "80.80",
          splitTest: "0.56",
          nonFloat: "not a float",
          anotherInvalid: "also not a float"
        })
      ).toThrow(
        `Passed config:float "nonFloat" = "not a float" is not a valid float.`
      );
    });
  });
});
