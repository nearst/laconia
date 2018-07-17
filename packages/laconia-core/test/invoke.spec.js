const invoke = require("../src/invoke.js");
const InvokeLaconiaError = require("../src/InvokeLaconiaError.js");
const UnhandledInvokeLaconiaError = require("../src/UnhandledInvokeLaconiaError");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const { yields } = require("laconia-test-helper");

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
      const functionErrors = ["Unhandled"];
      functionErrors.forEach(functionError => {
        it(`should throw an error when FunctionError is set to ${functionError}`, () => {
          invokeMock.mockImplementation(
            yields({
              FunctionError: functionError,
              Payload: "boom",
              StatusCode: expectedStatusCode
            })
          );
          const invoker = invoke("myLambda");
          return expect(invoker[method]()).rejects.toThrow(
            `${functionError} error returned by myLambda: boom`
          );
        });
      });

      xit("should throw an error when Unhandled error is rerturned", async () => {
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
        const invoker = invoke("heavy-operation");
        try {
          await invoker[method]();
          throw new Error("should not reach here");
        } catch (err) {
          expect(err).toBeInstanceOf(UnhandledInvokeLaconiaError);
          expect(err.name).toEqual("Unhandled");
          expect(err.functionName).toEqual("heavy-operation");
          expect(err.message).toEqual(errorPayload.errorMessage);
          expect(err.stack).toEqual(expect.stringMatching(/heavy-operation/));
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
        const invoker = invoke("heavy-operation");
        try {
          await invoker[method]();
          throw new Error("should not reach here");
        } catch (err) {
          expect(err).toBeInstanceOf(InvokeLaconiaError);
          expect(err.name).toEqual(errorPayload.errorType);
          expect(err.message).toEqual(errorPayload.errorMessage);
          expect(err.lambdaStackTrace).toEqual(errorPayload.stackTrace);
          expect(err.stack).toEqual(
            expect.stringContaining(`Caused by an error in heavy-operation Lambda:
    at module.exports.handler.laconia (/var/task/src/capture-card-payment.js:10:11)
    at laconia (/var/task/node_modules/laconia-core/src/laconia.js:12:28)
    at <anonymous>`)
          );
          expect(err.stack).toEqual(
            expect.stringMatching(
              /^SomeError[\W\w]*at LambdaInvoker[\W\w]*Caused by an error in heavy-operation Lambda/
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
        const invoker = invoke("foobar");
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
      const invoker = invoke("foobar");
      await invoker[method]();
      const invokeParams = invokeMock.mock.calls[0][0];
      expect(invokeParams).not.toHaveProperty("Payload");
    });

    it("should not set Payload parameter if it is not available", async () => {
      invokeMock.mockImplementation(
        yields({ FunctionError: undefined, StatusCode: expectedStatusCode })
      );
      const invoker = invoke("foobar");
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
          const invoker = invoke("foobar");
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

    it("should return Payload response", async () => {
      invokeMock.mockImplementation(
        yields({
          FunctionError: undefined,
          StatusCode: 200,
          Payload: "response"
        })
      );
      const invoker = invoke("foobar");
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
      const invoker = invoke("foobar");
      const response = await invoker.requestResponse();
      expect(response).toEqual({ value: "response" });
    });
  });

  it("should be able to override lambda", () => {
    const lambda = new AWS.Lambda();
    const invoker = invoke("foobar", { lambda });
    expect(invoker.lambda).toBe(lambda);
  });
});
