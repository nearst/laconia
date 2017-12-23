/* eslint-env jest */

const LambdaInvoker = require("../src/index.js");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");

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

  describe("fire and forget", () => {
    it("should throw an error when FunctionError is set to Handled", () => {
      invokeMock.mockImplementation((params, callback) =>
        callback(null, { FunctionError: "Handled", Payload: "boom" })
      );
      const invoker = new LambdaInvoker(lambda, "myLambda");
      return expect(invoker.fireAndForget()).rejects.toThrow(
        "Handled error returned by myLambda: boom"
      );
    });

    it("should throw an error when FunctionError is set to Unhandled", () => {
      invokeMock.mockImplementation((params, callback) =>
        callback(null, { FunctionError: "Unhandled", Payload: "boom" })
      );
      const invoker = new LambdaInvoker(lambda, "myLambda");
      return expect(invoker.fireAndForget()).rejects.toThrow(
        "Unhandled error returned by myLambda: boom"
      );
    });

    it("do not retry on error");

    it("should delegate InvocationType as Event");
    it("pass functionName");
    it("verifies status code 202");
    it("pass in payload");
  });

  describe("request response", () => {
    it("should delegate InvocationType as RequestResponse");
    it("verifies status code 200");
  });
});
