const BooleanConfigConverter = require("../src/BooleanConfigConverter");

describe("BooleanConfigConverter", () => {
  describe("when there is one env var set", () => {
    let configConverter;

    ["true", "TRUE", "yes", "anything"].forEach(truthyValue => {
      it(`converts truthy value '${truthyValue}' to true`, async () => {
        configConverter = new BooleanConfigConverter();
        const booleans = await configConverter.convertMultiple({
          enableFeature: truthyValue
        });
        expect(booleans).toHaveProperty("enableFeature", true);
      });
    });

    [
      "false",
      "FALSE",
      "null",
      "null ",
      "undefined",
      "0",
      "",
      " ",
      "no",
      "n",
      "off"
    ].forEach(falsyValue => {
      it(`converts falsy value '${falsyValue}' to false`, async () => {
        configConverter = new BooleanConfigConverter();
        const instances = await configConverter.convertMultiple({
          enableFeature: falsyValue
        });
        expect(instances).toHaveProperty("enableFeature", false);
      });
    });
  });

  describe("when there is multiple env vars set", () => {
    it("should return multiple instances", async () => {
      const configConverter = new BooleanConfigConverter();
      const booleans = await configConverter.convertMultiple({
        enableFeatureA: "off",
        enableFeatureB: "no"
      });
      expect(booleans).toHaveProperty("enableFeatureA", false);
      expect(booleans).toHaveProperty("enableFeatureB", false);
    });
  });
});
