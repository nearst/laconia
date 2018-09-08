const laconiaInvoker = require("../src/invoker");
const HandledInvokeLaconiaError = require("../src/HandledInvokeLaconiaError");
const UnhandledInvokeLaconiaError = require("../src/UnhandledInvokeLaconiaError");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const { yields } = require("@laconia/test-helper");

describe("invoke", () => {
  let invokeMock;

  beforeEach(() => {
    invokeMock = jest.fn();
    AWSMock.mock("Lambda", "invoke", invokeMock);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  const sharedTest = ({
    method,
    expectedInvocationType,
    expectedStatusCode
  }) => {
    describe("when getting FunctionError", () => {
      it("should throw an error when Unhandled error is rerturned", async () => {
        const errorPayload = {
          errorMessage:
            "Handler 'handler' missing on module 'src/capture-card-payment'"
        };
        invokeMock.mockImplementation(
          yields({
            FunctionError: "Unhandled",
            Payload: JSON.stringify(errorPayload),
            StatusCode: expectedStatusCode
          })
        );
        const invoker = laconiaInvoker("heavy-operation");
        try {
          await invoker[method]();
          throw new Error("should not reach here");
        } catch (err) {
          expect(err).toBeInstanceOf(UnhandledInvokeLaconiaError);
          expect(err.name).toEqual("Unhandled");
          expect(err.functionName).toEqual("heavy-operation");
          expect(err.message).toEqual(
            `Error in heavy-operation: ${errorPayload.errorMessage}`
          );
        }
      });

      it("should wrap Payload in InvokeLaconiaError when Handled Error is returned", async () => {
        const errorPayload = {
          errorMessage: "paymentReference is required",
          errorType: "SomeError",
          stackTrace: [
            "module.exports.handler.laconia (/var/task/src/capture-card-payment.js:10:11)",
            "laconia (/var/task/node_modules/laconia-core/src/laconia.js:12:28)",
            "<anonymous>"
          ]
        };
        invokeMock.mockImplementation(
          yields({
            FunctionError: "Handled",
            Payload: JSON.stringify(errorPayload),
            StatusCode: expectedStatusCode
          })
        );
        const invoker = laconiaInvoker("heavy-operation");
        try {
          await invoker[method]();
          throw new Error("should not reach here");
        } catch (err) {
          expect(err).toBeInstanceOf(HandledInvokeLaconiaError);
          expect(err.name).toEqual(errorPayload.errorType);
          expect(err.message).toEqual(
            `Error in heavy-operation: ${errorPayload.errorMessage}`
          );
          expect(err.lambdaStackTrace).toEqual(errorPayload.stackTrace);
          expect(err.stack).toEqual(
            expect.stringContaining(`Caused by an error in heavy-operation Lambda:
    at module.exports.handler.laconia (/var/task/src/capture-card-payment.js:10:11)
    at laconia (/var/task/node_modules/laconia-core/src/laconia.js:12:28)
    at <anonymous>`)
          );
          expect(err.stack).toEqual(
            expect.stringMatching(
              /^SomeError: Error in heavy-operation: paymentReference is required[\W\w]*at LambdaInvoker[\W\w]*Caused by an error in heavy-operation Lambda/
            )
          );
        }
      });
    });

    describe("when invoking Lambda", () => {
      beforeEach(() => {
        invokeMock.mockImplementation(
          yields({ FunctionError: undefined, StatusCode: expectedStatusCode })
        );
        const invoker = laconiaInvoker("foobar");
        return invoker[method]({ biz: "baz" });
      });

      it("should set InvocationType parameter", () => {
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({ InvocationType: expectedInvocationType }),
          expect.any(Function)
        );
      });

      it("should set FunctionName parameter", () => {
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({ FunctionName: "foobar" }),
          expect.any(Function)
        );
      });

      it("should set and stringify Payload parameter", () => {
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({ Payload: JSON.stringify({ biz: "baz" }) }),
          expect.any(Function)
        );
      });
    });

    it("should not set Payload parameter if it is not available", async () => {
      invokeMock.mockImplementation(
        yields({ FunctionError: undefined, StatusCode: expectedStatusCode })
      );
      const invoker = laconiaInvoker("foobar");
      await invoker[method]();
      const invokeParams = invokeMock.mock.calls[0][0];
      expect(invokeParams).not.toHaveProperty("Payload");
    });

    it("should not set Payload parameter if it is not available", async () => {
      invokeMock.mockImplementation(
        yields({ FunctionError: undefined, StatusCode: expectedStatusCode })
      );
      const invoker = laconiaInvoker("foobar");
      await invoker[method]();
      const invokeParams = invokeMock.mock.calls[0][0];
      expect(invokeParams).not.toHaveProperty("Payload");
    });

    describe(`when getting non ${expectedStatusCode} StatusCode`, () => {
      const invalidStatusCodes = [200, 201, 202, 203, 400, 401].filter(
        code => code !== expectedStatusCode
      );
      invalidStatusCodes.forEach(statusCode => {
        it(`throws error when StatusCode returned is ${statusCode}`, () => {
          invokeMock.mockImplementation(
            yields({ FunctionError: undefined, StatusCode: statusCode })
          );
          const invoker = laconiaInvoker("foobar");
          return expect(invoker[method]()).rejects.toThrow(
            `Status code returned was: ${statusCode}`
          );
        });
      });
    });
  };

  describe("fire and forget", () => {
    sharedTest({
      method: "fireAndForget",
      expectedInvocationType: "Event",
      expectedStatusCode: 202
    });
  });

  describe("request response", () => {
    sharedTest({
      method: "requestResponse",
      expectedInvocationType: "RequestResponse",
      expectedStatusCode: 200
    });

    beforeEach(() => {
      invokeMock.mockImplementation(
        yields({
          FunctionError: undefined,
          StatusCode: 200,
          Payload: "response"
        })
      );
    });

    it("should return Payload response", async () => {
      const invoker = laconiaInvoker("foobar");
      const response = await invoker.requestResponse();
      expect(response).toEqual("response");
    });

    it("should JSON parse Payload response if JSON is returned", async () => {
      invokeMock.mockImplementation(
        yields({
          FunctionError: undefined,
          StatusCode: 200,
          Payload: '{"value":"response"}'
        })
      );
      const invoker = laconiaInvoker("foobar");
      const response = await invoker.requestResponse();
      expect(response).toEqual({ value: "response" });
    });

    it("should set LogType to None", async () => {
      const invoker = laconiaInvoker("foobar");
      await invoker.requestResponse();
      expect(invokeMock).toBeCalledWith(
        expect.objectContaining({ LogType: "None" }),
        expect.any(Function)
      );
    });

    describe("when requestLogs is enabled", () => {
      it("should set LogType to Tail", async () => {
        const invoker = laconiaInvoker("foobar", { requestLogs: true });
        await invoker.requestResponse();
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({ LogType: "Tail" }),
          expect.any(Function)
        );
      });

      it("should decode LogResult returned", async () => {
        const errorPayload = {
          errorMessage: "paymentReference is required",
          errorType: "SomeError",
          stackTrace: ["module.exports.handler.laconia"]
        };
        invokeMock.mockImplementation(
          yields({
            FunctionError: "Handled",
            Payload: JSON.stringify(errorPayload),
            StatusCode: 200,
            LogResult:
              "U1RBUlQgUmVxdWVzdElkOiBhNzVmMjIzZi0zMWI5LTExZTctYmRmYy0xMzJkMDc0Zjc3YzggVmVyc2lvbjogJExBVEVTVAoyMDE3LTA1LTA1VDE3OjM4OjMwLjY4NloJYTc1ZjIyM2YtMzFiOS0xMWU3LWJkZmMtMTMyZDA3NGY3N2M4CXsibmFtZSI6ImpvbmF0aGFuIn0KRU5EIFJlcXVlc3RJZDogYTc1ZjIyM2YtMzFiOS0xMWU3LWJkZmMtMTMyZDA3NGY3N2M4ClJFUE9SVCBSZXF1ZXN0SWQ6IGE3NWYyMjNmLTMxYjktMTFlNy1iZGZjLTEzMmQwNzRmNzdjOAlEdXJhdGlvbjogMTAwMjcuMjkgbXMJQmlsbGVkIER1cmF0aW9uOiAxMDEwMCBtcyAJTWVtb3J5IFNpemU6IDEyOCBNQglNYXggTWVtb3J5IFVzZWQ6IDE3IE1CCQo="
          })
        );
        const invoker = laconiaInvoker("heavy-operation");
        try {
          await invoker.requestResponse();
          throw new Error("should not reach here");
        } catch (err) {
          expect(err.logs)
            .toEqual(`START RequestId: a75f223f-31b9-11e7-bdfc-132d074f77c8 Version: $LATEST
2017-05-05T17:38:30.686Z	a75f223f-31b9-11e7-bdfc-132d074f77c8	{"name":"jonathan"}
END RequestId: a75f223f-31b9-11e7-bdfc-132d074f77c8
REPORT RequestId: a75f223f-31b9-11e7-bdfc-132d074f77c8	Duration: 10027.29 ms	Billed Duration: 10100 ms 	Memory Size: 128 MB	Max Memory Used: 17 MB	
`);
        }
      });
    });
  });

  it("should be able to override lambda", () => {
    const lambda = new AWS.Lambda();
    const invoker = laconiaInvoker("foobar", { lambda });
    expect(invoker.lambda).toBe(lambda);
  });
});
