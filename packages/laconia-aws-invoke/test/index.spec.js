const { lambdaInvoker } = require("../src/index.js");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const { yields } = require("laconia-test-helper");

describe("aws invoke", () => {
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
      const functionErrors = ["Handled", "Unhandled"];
      functionErrors.forEach(functionError => {
        it(`should throw an error when FunctionError is set to ${functionError}`, () => {
          invokeMock.mockImplementation(
            yields({
              FunctionError: functionError,
              Payload: "boom",
              StatusCode: expectedStatusCode
            })
          );
          const invoker = lambdaInvoker("myLambda");
          return expect(invoker[method]()).rejects.toThrow(
            `${functionError} error returned by myLambda: boom`
          );
        });
      });
    });

    describe("when invoking Lambda", () => {
      beforeEach(() => {
        invokeMock.mockImplementation(
          yields({ FunctionError: undefined, StatusCode: expectedStatusCode })
        );
        const invoker = lambdaInvoker("foobar");
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
      const invoker = lambdaInvoker("foobar");
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
          const invoker = lambdaInvoker("foobar");
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
      const invoker = lambdaInvoker("foobar");
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
      const invoker = lambdaInvoker("foobar");
      const response = await invoker.requestResponse();
      expect(response).toEqual({ value: "response" });
    });
  });

  it("should be able to override lambda", () => {
    const lambda = new AWS.Lambda();
    const invoker = lambdaInvoker("foobar", { lambda });
    expect(invoker.lambda).toBe(lambda);
  });
});
