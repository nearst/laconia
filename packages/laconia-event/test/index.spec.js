const event = require("../src/index");

describe("@laconia/event", () => {
  describe("#s3Event", () => {
    it("has s3Event function", () => {
      expect(event.s3Event).toBeFunction();
    });

    it("returns an instance of inputConverter", () => {
      const instances = event.s3Event()({});
      expect(instances).toHaveProperty("$inputConverter");
    });
  });

  describe("#s3Stream", () => {
    it("has s3Stream function", () => {
      expect(event.s3Event).toBeFunction();
    });

    it("returns an instance of inputConverter", () => {
      const instances = event.s3Stream()({});
      expect(instances).toHaveProperty("$inputConverter");
    });
  });

  describe("#s3Json", () => {
    it("has s3Json function", () => {
      expect(event.s3Json).toBeFunction();
    });

    it("returns an instance of inputConverter", () => {
      const instances = event.s3Json()({});
      expect(instances).toHaveProperty("$inputConverter");
    });
  });

  describe("#kinesisJson", () => {
    it("has kinesisJson function", () => {
      expect(event.kinesisJson).toBeFunction();
    });

    it("returns an instance of inputConverter", () => {
      const instances = event.kinesisJson()({});
      expect(instances).toHaveProperty("$inputConverter");
    });
  });
});
