const { mockClient } = require("aws-sdk-client-mock");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const { matchers } = require("@laconia/test-helper");
const { LaconiaContext } = require("@laconia/core");
expect.extend(matchers);

exports.sharedBehaviour = batchHandler => {
  describe("shared batch behaviour", () => {
    let lambdaMock, event, context, callback;
    let itemListener, stopListener, endListener, startListener;

    beforeEach(() => {
      lambdaMock = mockClient(LambdaClient);
      lambdaMock.on(InvokeCommand).resolves({
        StatusCode: 202,
        Payload: Buffer.from(JSON.stringify({ value: "response" }))
      });

      itemListener = jest.fn();
      stopListener = jest.fn();
      endListener = jest.fn();
      startListener = jest.fn();
      event = {};
      context = {
        functionName: "blah",
        getRemainingTimeInMillis: () => 100000
      };
      callback = jest.fn();
    });

    afterEach(() => {
      lambdaMock.reset();
    });

    describe("when finish processing in a single lambda execution", () => {
      beforeEach(async () => {
        await batchHandler()
          .register(() => ({ $lambda: new LambdaClient() }))
          .on("start", startListener)
          .on("item", itemListener)
          .on("stop", stopListener)
          .on("end", endListener)(event, context, callback);
      });

      it("should notify listeners on lifecycle events", () => {
        expect(startListener).toHaveBeenCalledTimes(1);
        expect(startListener).toHaveBeenCalledWith(expect.any(LaconiaContext));
        expect(endListener).toHaveBeenCalledTimes(1);
        expect(startListener).toHaveBeenCalledWith(expect.any(LaconiaContext));
        expect(stopListener).not.toHaveBeenCalled();

        expect(startListener).toHaveBeenCalledBefore(itemListener);
        expect(startListener).toHaveBeenCalledBefore(endListener);
      });

      it("should process all items", async () => {
        expect(itemListener).toHaveBeenCalledTimes(3);
        expect(itemListener).toHaveBeenCalledWith(expect.any(LaconiaContext), {
          Artist: "Foo"
        });
        expect(itemListener).toHaveBeenCalledWith(expect.any(LaconiaContext), {
          Artist: "Bar"
        });
        expect(itemListener).toHaveBeenCalledWith(expect.any(LaconiaContext), {
          Artist: "Fiz"
        });
      });

      it("should not recurse", () => {
        expect(lambdaMock.calls().length).toBe(0);
      });
    });

    describe("when time is up", () => {
      beforeEach(async () => {
        context.getRemainingTimeInMillis = () => 5000;
        await batchHandler()
          .register(() => ({ $lambda: new LambdaClient() }))
          .on("start", startListener)
          .on("item", itemListener)
          .on("stop", stopListener)
          .on("end", endListener)(event, context, callback);
      });

      it("should stop processing when time is up", async () => {
        expect(itemListener).toHaveBeenCalledTimes(1);
      });

      it("should notify listeners on lifecycle events", () => {
        expect(startListener).toHaveBeenCalledTimes(1);
        expect(stopListener).toHaveBeenCalledTimes(1);
        expect(stopListener).toHaveBeenCalledWith(expect.any(LaconiaContext), {
          index: 0
        });
        expect(endListener).not.toHaveBeenCalled();
      });

      it("should recurse when time is up", async () => {
        const calls = lambdaMock.calls();
        expect(calls.length).toBe(1);
        const invokeCall = calls[0];

        expect(invokeCall.args[0].input).toEqual(
          expect.objectContaining({
            FunctionName: context.functionName,
            InvocationType: "Event"
          })
        );

        const payload = JSON.parse(invokeCall.args[0].input.Payload);
        expect(payload).toEqual({ cursor: { index: 0 } });
      });
    });

    describe("when timeNeededToRecurseInMillis is configured", () => {
      it("stops if time is not enough to process items", async () => {
        context.getRemainingTimeInMillis = () => 10000;
        await batchHandler({ timeNeededToRecurseInMillis: 10000 })
          .register(() => ({ $lambda: new LambdaClient() }))
          .on("stop", stopListener)(event, context, callback);

        expect(stopListener).toHaveBeenCalled();
      });

      it("does not stop if time is enough to process items", async () => {
        context.getRemainingTimeInMillis = () => 10001;
        await batchHandler({ timeNeededToRecurseInMillis: 10000 })
          .register(() => ({ $lambda: new LambdaClient() }))
          .on("stop", stopListener)(event, context, callback);

        expect(stopListener).not.toHaveBeenCalled();
      });
    });

    describe("when completing recursion", () => {
      it("should process all items", async () => {
        context.getRemainingTimeInMillis = () => 5000;
        const endPromise = new Promise(resolve => {
          const handler = batchHandler()
            .register(() => ({ $lambda: new LambdaClient() }))
            .on("start", startListener)
            .on("item", itemListener)
            .on("end", () => {
              resolve();
            });

          lambdaMock.on(InvokeCommand).callsFake(params => {
            handler(JSON.parse(params.Payload), context, callback);
            return {
              FunctionError: undefined,
              StatusCode: 202,
              Payload: Buffer.from(JSON.stringify({ value: "response" }))
            };
          });

          handler(event, context, callback);
        });

        await endPromise;

        expect(lambdaMock.calls().length).toBe(2);
        expect(startListener).toHaveBeenCalledTimes(1);
        expect(itemListener).toHaveBeenCalledTimes(3);
        expect(itemListener).toHaveBeenCalledWith(expect.any(LaconiaContext), {
          Artist: "Foo"
        });
        expect(itemListener).toHaveBeenCalledWith(expect.any(LaconiaContext), {
          Artist: "Bar"
        });
        expect(itemListener).toHaveBeenCalledWith(expect.any(LaconiaContext), {
          Artist: "Fiz"
        });
      });
    });
  });
};
