const laconiaTest = require("../src/laconiaTest");
const LaconiaTester = require("../src/LaconiaTester");

describe("laconiaTest", () => {
  describe("when default options is used", () => {
    it("returns a newly created LaconiaTester", async () => {
      const result = laconiaTest("operation");

      expect(result).toBeInstanceOf(LaconiaTester);
    });

    it("should create an instance of laconia invoker", async () => {
      const result = laconiaTest("operation");

      expect(result.invoker).toBeDefined();
    });

    it("should set requestLogs flag to true", async () => {
      const result = laconiaTest("operation");

      expect(result.invoker.requestLogs).toBe(true);
    });

    it("should throw error when spy is not available", async () => {
      expect(() => laconiaTest("operation").spy).toThrow(
        "spy is not enabled, check documentation to set the required options to enable this feature"
      );
    });
  });

  it("should be able to override lambda", () => {
    const lambda = jest.fn();
    const tester = laconiaTest("foobar", { lambda });
    expect(tester.invoker.lambda).toBe(lambda);
  });

  describe("when spy options are set", () => {
    it("should make spy object available", () => {
      const result = laconiaTest("operation", {
        spy: { bucketName: "bucket name" }
      });

      expect(result.spy).toHaveProperty("track");
    });

    it("should be able to override s3", () => {
      const s3 = jest.fn();
      const result = laconiaTest("operation", {
        spy: { bucketName: "bucket name", s3 }
      });

      expect(result.spy.s3).toBe(s3);
    });
  });
});
