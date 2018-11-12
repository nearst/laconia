const event = require("../src/index");

describe("@laconia/event", () => {
  describe("#s3", () => {
    it("has s3 function", () => {
      expect(event.s3Event).toBeFunction();
    });

    it("returns an instance of inputConverter", () => {
      const instances = event.s3Event()({});
      expect(instances).toHaveProperty("$inputConverter");
    });
  });
});
