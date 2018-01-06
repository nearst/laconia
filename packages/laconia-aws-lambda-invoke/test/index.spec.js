/* eslint-env jest */

const LambdaInvoker = require("../src/index.js");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");

const yields = arg => (params, callback) => callback(null, arg);

describe("aws invoke", () => {
  let invokeMock;
  let lambda;

  beforeEach(() => {
    invokeMock = jest.fn();
    AWSMock.mock("Lambda", "invoke", invokeMock);
    lambda = new AWS.Lambda();
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
          const invoker = new LambdaInvoker(lambda, "myLambda");
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
        const invoker = new LambdaInvoker(lambda, "foobar");
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

    it("should not set Payload parameter if it is not available", () => {
      invokeMock.mockImplementation(
        yields({ FunctionError: undefined, StatusCode: expectedStatusCode })
      );
      const invoker = new LambdaInvoker(lambda, "foobar");
      return invoker[method]().then(_ => {
        const invokeParams = invokeMock.mock.calls[0][0];
        expect(invokeParams).not.toHaveProperty("Payload");
      });
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
          const invoker = new LambdaInvoker(lambda, "foobar");
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

    it("should return Payload response", () => {
      invokeMock.mockImplementation(
        yields({
          FunctionError: undefined,
          StatusCode: 200,
          Payload: "response"
        })
      );
      const invoker = new LambdaInvoker(lambda, "foobar");
      return invoker.requestResponse().then(response => {
        expect(response).toEqual("response");
      });
    });

    it("should JSON parse Payload response if JSON is returned", () => {
      invokeMock.mockImplementation(
        yields({
          FunctionError: undefined,
          StatusCode: 200,
          Payload: '{"value":"response"}'
        })
      );
      const invoker = new LambdaInvoker(lambda, "foobar");
      return invoker.requestResponse().then(response => {
        expect(response).toEqual({ value: "response" });
      });
    });
  });
});
