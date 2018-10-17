const EnvVarBooleanConfigFactory = require("../src/EnvVarBooleanConfigFactory");

describe("EnvVarBooleanConfigFactory", () => {
  describe("when there is no env var set", () => {
    let booleanConfigFactory;

    beforeEach(() => {
      booleanConfigFactory = new EnvVarBooleanConfigFactory({
        NOTHING: "empty"
      });
    });

    it("return empty instances", async () => {
      const instances = await booleanConfigFactory.makeInstances();
      expect(instances).toEqual({});
    });
  });

  describe("when there is one env var set", () => {
    let booleanConfigFactory;

    ["true", "TRUE", "yes", "anything"].forEach(truthyValue => {
      it(`converts truthy value '${truthyValue}' to true`, async () => {
        booleanConfigFactory = new EnvVarBooleanConfigFactory({
          LACONIA_BOOLEANCONFIG_ENABLE_FEATURE: truthyValue
        });
        const instances = await booleanConfigFactory.makeInstances();
        expect(instances).toHaveProperty("enableFeature", true);
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
        booleanConfigFactory = new EnvVarBooleanConfigFactory({
          LACONIA_BOOLEANCONFIG_ENABLE_FEATURE: falsyValue
        });
        const instances = await booleanConfigFactory.makeInstances();
        expect(instances).toHaveProperty("enableFeature", false);
      });
    });
  });

  describe("when there is multiple env vars set", () => {
    it("should return multiple instances", async () => {
      const booleanConfigFactory = new EnvVarBooleanConfigFactory({
        LACONIA_BOOLEANCONFIG_ENABLE_FEATURE_A: "off",
        LACONIA_BOOLEANCONFIG_ENABLE_FEATURE_B: "no"
      });
      const instances = await booleanConfigFactory.makeInstances();
      expect(instances).toHaveProperty("enableFeatureA", false);
      expect(instances).toHaveProperty("enableFeatureB", false);
    });
  });
});
