const IntegerConfigConverter = require("../src/IntegerConfigConverter");

describe("IntegerConfigConverter", () => {
  describe("when there is one env var set", () => {
    let configConverter;

    it("converts an integer value to an integer", async () => {
      configConverter = new IntegerConfigConverter();
      const instances = await configConverter.convertMultiple({
        port: "9999"
      });
      expect(instances).toHaveProperty("port", 9999);
    });
  });

  describe("when there is multiple env vars set", () => {
    it("should return multiple instances", async () => {
      const configConverter = new IntegerConfigConverter();
      const integers = await configConverter.convertMultiple({
        port: "9999",
        retryCount: "7"
      });
      expect(integers).toHaveProperty("port", 9999);
      expect(integers).toHaveProperty("retryCount", 7);
    });
  });
});
