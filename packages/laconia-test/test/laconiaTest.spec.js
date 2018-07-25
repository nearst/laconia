const AWS = require("aws-sdk");
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
  });

  it("should be able to override lambda", () => {
    const lambda = new AWS.Lambda();
    const tester = laconiaTest("foobar", { lambda });
    expect(tester.invoker.lambda).toBe(lambda);
  });
});
