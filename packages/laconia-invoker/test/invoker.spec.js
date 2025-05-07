const laconiaInvoker = require("../src/invoker");
const HandledInvokeLaconiaError = require("../src/HandledInvokeLaconiaError");
const UnhandledInvokeLaconiaError = require("../src/UnhandledInvokeLaconiaError");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const { mockClient } = require("aws-sdk-client-mock");

describe("invoke", () => {
  const awsLambda = mockClient(LambdaClient);

  beforeEach(() => {
    awsLambda.reset();
  });

  const sharedTest = ({
    method,
    expectedInvocationType,
    expectedStatusCode
  }) => {
    describe("when getting FunctionError", () => {
      it("should throw an error when Unhandled error is returned", async () => {
        const errorPayload = {
          errorMessage:
            "Handler 'handler' missing on module 'src/capture-card-payment'"
        };

        awsLambda.on(InvokeCommand).resolves({
          FunctionError: "Unhandled",
          Payload: JSON.stringify(errorPayload),
          StatusCode: expectedStatusCode
        });

        const invoker = laconiaInvoker("heavy-operation", awsLambda);
        await expect(invoker[method]()).rejects.toThrow(
          UnhandledInvokeLaconiaError
        );
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

        awsLambda.on(InvokeCommand).resolves({
          FunctionError: "Handled",
          Payload: JSON.stringify(errorPayload),
          StatusCode: expectedStatusCode
        });

        const invoker = laconiaInvoker("heavy-operation", awsLambda);
        await expect(invoker[method]()).rejects.toThrow(
          HandledInvokeLaconiaError
        );
      });
    });

    describe("when invoking Lambda", () => {
      beforeEach(() => {
        awsLambda.on(InvokeCommand).resolves({
          FunctionError: undefined,
          StatusCode: expectedStatusCode
        });
      });

      it("should set InvocationType parameter", async () => {
        const invoker = laconiaInvoker("foobar", awsLambda);
        await invoker[method]({ biz: "baz" });

        expect(awsLambda).toHaveReceivedCommandWith(InvokeCommand, {
          InvocationType: expectedInvocationType
        });
      });

      it("should set FunctionName parameter", async () => {
        const invoker = laconiaInvoker("foobar", awsLambda);
        await invoker[method]({ biz: "baz" });

        expect(awsLambda).toHaveReceivedCommandWith(InvokeCommand, {
          FunctionName: "foobar"
        });
      });

      it("should set and stringify Payload parameter", async () => {
        const invoker = laconiaInvoker("foobar", awsLambda);
        await invoker[method]({ biz: "baz" });

        expect(awsLambda).toHaveReceivedCommandWith(InvokeCommand, {
          Payload: JSON.stringify({ biz: "baz" })
        });
      });
    });

    it("should not set Payload parameter if it is not available", async () => {
      awsLambda.on(InvokeCommand).resolves({
        FunctionError: undefined,
        StatusCode: expectedStatusCode
      });

      const invoker = laconiaInvoker("foobar", awsLambda);
      await invoker[method]();

      expect(awsLambda).toHaveReceivedCommandWith(InvokeCommand, {
        Payload: undefined
      });
    });

    describe(`when getting non ${expectedStatusCode} StatusCode`, () => {
      const invalidStatusCodes = [200, 201, 202, 203, 400, 401].filter(
        code => code !== expectedStatusCode
      );

      invalidStatusCodes.forEach(statusCode => {
        it(`throws error when StatusCode returned is ${statusCode}`, async () => {
          awsLambda.on(InvokeCommand).resolves({
            FunctionError: undefined,
            StatusCode: statusCode
          });

          const invoker = laconiaInvoker("foobar", awsLambda);
          await expect(invoker[method]()).rejects.toThrow(
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
      awsLambda.on(InvokeCommand).resolves({
        FunctionError: undefined,
        StatusCode: 200,
        Payload: "response"
      });
    });

    it("should return Payload response", async () => {
      const invoker = laconiaInvoker("foobar", awsLambda);
      const response = await invoker.requestResponse();
      expect(response).toEqual("response");
    });

    it("should JSON parse Payload response if JSON is returned", async () => {
      awsLambda.on(InvokeCommand).resolves({
        FunctionError: undefined,
        StatusCode: 200,
        Payload: '{"value":"response"}'
      });

      const invoker = laconiaInvoker("foobar", awsLambda);
      const response = await invoker.requestResponse();
      expect(response).toEqual({ value: "response" });
    });

    it("should set LogType to None", async () => {
      const invoker = laconiaInvoker("foobar", awsLambda);
      await invoker.requestResponse();

      expect(awsLambda).toHaveReceivedCommandWith(InvokeCommand, {
        LogType: "None"
      });
    });

    describe("when requestLogs is enabled", () => {
      it("should set LogType to Tail", async () => {
        const invoker = laconiaInvoker("foobar", awsLambda, {
          requestLogs: true
        });
        await invoker.requestResponse();

        expect(awsLambda).toHaveReceivedCommandWith(InvokeCommand, {
          LogType: "Tail"
        });
      });
    });
  });
});
