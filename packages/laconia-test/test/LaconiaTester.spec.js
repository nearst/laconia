const LaconiaTester = require("../src/LaconiaTester");
const { HandledInvokeLaconiaError } = require("laconia-invoke");

const errorPayload = {
  errorMessage: "paymentReference is required",
  errorType: "SomeError",
  stackTrace: [
    "module.exports.handler.laconia (/var/task/src/capture-card-payment.js:10:11)",
    "laconia (/var/task/node_modules/laconia-core/src/laconia.js:12:28)",
    "<anonymous>"
  ]
};

describe("LaconiaTester", () => {
  describe("#requestResponse", () => {
    it("delegates to invoker", async () => {
      const invoker = {
        requestResponse: jest.fn().mockResolvedValue("baz")
      };
      const result = await new LaconiaTester(invoker).requestResponse({
        foo: "bar"
      });

      expect(invoker.requestResponse).toBeCalledWith({ foo: "bar" });
      expect(result).toEqual("baz");
    });

    it("should log Lambda logs on failure", async () => {
      const base64logs =
        "U1RBUlQgUmVxdWVzdElkOiBhNzVmMjIzZi0zMWI5LTExZTctYmRmYy0xMzJkMDc0Zjc3YzggVmVyc2lvbjogJExBVEVTVAoyMDE3LTA1LTA1VDE3OjM4OjMwLjY4NloJYTc1ZjIyM2YtMzFiOS0xMWU3LWJkZmMtMTMyZDA3NGY3N2M4CXsibmFtZSI6ImpvbmF0aGFuIn0KRU5EIFJlcXVlc3RJZDogYTc1ZjIyM2YtMzFiOS0xMWU3LWJkZmMtMTMyZDA3NGY3N2M4ClJFUE9SVCBSZXF1ZXN0SWQ6IGE3NWYyMjNmLTMxYjktMTFlNy1iZGZjLTEzMmQwNzRmNzdjOAlEdXJhdGlvbjogMTAwMjcuMjkgbXMJQmlsbGVkIER1cmF0aW9uOiAxMDEwMCBtcyAJTWVtb3J5IFNpemU6IDEyOCBNQglNYXggTWVtb3J5IFVzZWQ6IDE3IE1CCQo=";
      const logs = `heavy-operation Lambda logs:
START RequestId: a75f223f-31b9-11e7-bdfc-132d074f77c8 Version: $LATEST
2017-05-05T17:38:30.686Z	a75f223f-31b9-11e7-bdfc-132d074f77c8	{"name":"jonathan"}
END RequestId: a75f223f-31b9-11e7-bdfc-132d074f77c8
REPORT RequestId: a75f223f-31b9-11e7-bdfc-132d074f77c8	Duration: 10027.29 ms	Billed Duration: 10100 ms 	Memory Size: 128 MB	Max Memory Used: 17 MB	
`;
      const invoker = {
        requestResponse: jest
          .fn()
          .mockRejectedValue(
            new HandledInvokeLaconiaError(
              "heavy-operation",
              errorPayload,
              base64logs
            )
          )
      };
      const logger = jest.fn();
      await expect(
        new LaconiaTester(invoker, {
          logger: logger
        }).requestResponse("something")
      ).rejects.toThrow();
      expect(logger).toBeCalledWith(logs);
    });

    it("should not log lambda logs if not available", async () => {
      const invoker = {
        requestResponse: jest.fn().mockRejectedValue(new Error("boom"))
      };
      const logger = jest.fn();
      await expect(
        new LaconiaTester(invoker, {
          logger: logger
        }).requestResponse("something")
      ).rejects.toThrow();
      expect(logger).not.toBeCalled();
    });
  });

  describe("#fireAndForget", () => {
    it("delegates to invoker", async () => {
      const invoker = {
        fireAndForget: jest.fn().mockResolvedValue("baz")
      };
      const result = await new LaconiaTester(invoker).fireAndForget({
        foo: "bar"
      });

      expect(invoker.fireAndForget).toBeCalledWith({ foo: "bar" });
      expect(result).toEqual("baz");
    });
  });
});
