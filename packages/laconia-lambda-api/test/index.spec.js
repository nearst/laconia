const event = require("../src/index");

describe("@laconia/event", () => {
  describe(`#lambdaApi`, () => {
    it(`has lambdaApi function`, () => {
      expect(event["lambdaApi"]).toBeFunction();
    });

    it("returns an instance of inputConverter", () => {
      const instances = event["lambdaApi"]()({});
      expect(instances).toHaveProperty("$inputConverter");
    });
  });
});
