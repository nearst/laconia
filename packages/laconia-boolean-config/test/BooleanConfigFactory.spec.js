const BooleanConfigFactory = require("../src/BooleanConfigFactory");

describe("BooleanConfigFactory", () => {
  // describe("when there is no env var set", () => {
  //   let booleanConfigFactory;

  //   beforeEach(() => {
  //     booleanConfigFactory = new BooleanConfigFactory({
  //       NOTHING: "empty"
  //     });
  //   });

  //   it("return empty instances", async () => {
  //     const instances = await booleanConfigFactory.makeInstances();
  //     expect(instances).toEqual({});
  //   });
  // });

  describe("when there is one env var set", () => {
    let booleanConfigFactory;

    ["true", "TRUE", "yes", "anything"].forEach(truthyValue => {
      it(`converts truthy value '${truthyValue}' to true`, async () => {
        booleanConfigFactory = new BooleanConfigFactory({
          enableFeature: truthyValue
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
        booleanConfigFactory = new BooleanConfigFactory({
          enableFeature: falsyValue
        });
        const instances = await booleanConfigFactory.makeInstances();
        expect(instances).toHaveProperty("enableFeature", false);
      });
    });
  });

  describe("when there is multiple env vars set", () => {
    it("should return multiple instances", async () => {
      const booleanConfigFactory = new BooleanConfigFactory({
        enableFeatureA: "off",
        enableFeatureB: "no"
      });
      const instances = await booleanConfigFactory.makeInstances();
      expect(instances).toHaveProperty("enableFeatureA", false);
      expect(instances).toHaveProperty("enableFeatureB", false);
    });
  });
});
