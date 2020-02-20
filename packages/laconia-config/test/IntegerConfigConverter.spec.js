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

    it("throws an error when value is not an integer", async () => {
      configConverter = new IntegerConfigConverter();
      await expect(() =>
        configConverter.convertMultiple({
          port: "someString"
        })
      ).toThrow(
        `Passed config:integer "port" = "someString" is not a valid integer.`
      );
    });

    it("throws an error when value is empty", async () => {
      configConverter = new IntegerConfigConverter();
      await expect(() =>
        configConverter.convertMultiple({
          port: ""
        })
      ).toThrow(`Passed config:integer "port" = "" is not a valid integer.`);
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

    it("throws an error when one value is not an integer", async () => {
      const configConverter = new IntegerConfigConverter();
      await expect(() =>
        configConverter.convertMultiple({
          port: "9999",
          retryCount: "7",
          notValid: "someString",
          // It throws an error as soon as one value is NaN
          anotherNonValid: "anotherString"
        })
      ).toThrow(
        `Passed config:integer "notValid" = "someString" is not a valid integer.`
      );
    });
  });
});
