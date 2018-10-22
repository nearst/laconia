const BooleanConverter = require("../src/BooleanConverter");

describe("BooleanConverter", () => {
  describe("when there is one env var set", () => {
    let booleanConverter;

    ["true", "TRUE", "yes", "anything"].forEach(truthyValue => {
      it(`converts truthy value '${truthyValue}' to true`, async () => {
        booleanConverter = new BooleanConverter();
        const booleans = await booleanConverter.convertMultiple({
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
      "off"
    ].forEach(falsyValue => {
      it(`converts falsy value '${falsyValue}' to false`, async () => {
        booleanConverter = new BooleanConverter();
        const instances = await booleanConverter.convertMultiple({
          enableFeature: falsyValue
        });
        expect(instances).toHaveProperty("enableFeature", false);
      });
    });
  });

  describe("when there is multiple env vars set", () => {
    it("should return multiple instances", async () => {
      const booleanConverter = new BooleanConverter();
      const booleans = await booleanConverter.convertMultiple({
        enableFeatureA: "off",
        enableFeatureB: "no"
      });
      expect(booleans).toHaveProperty("enableFeatureA", false);
      expect(booleans).toHaveProperty("enableFeatureB", false);
    });
  });
});
