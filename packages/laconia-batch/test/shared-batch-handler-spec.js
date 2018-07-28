const AWSMock = require("aws-sdk-mock");
const { matchers } = require("laconia-test-helper");
const { LaconiaContext } = require("laconia-core");
expect.extend(matchers);

exports.sharedBehaviour = batchHandler => {
  describe("shared batch behaviour", () => {
    let invokeMock, event, context, callback;
    let itemListener, stopListener, endListener, startListener;

    beforeEach(() => {
      invokeMock = jest.fn();
      AWSMock.mock("Lambda", "invoke", invokeMock);

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
      AWSMock.restore();
    });

    describe("when finish processing in a single lambda execution", () => {
      beforeEach(async () => {
        await batchHandler()
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
        expect(invokeMock).not.toHaveBeenCalled();
      });
    });

    describe("when time is up", () => {
      beforeEach(async () => {
        context.getRemainingTimeInMillis = () => 5000;
        await batchHandler()
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
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({
            FunctionName: context.functionName,
            InvocationType: "Event",
            Payload: JSON.stringify({ cursor: { index: 0 } })
          }),
          expect.any(Function)
        );
      });
    });

    describe("when timeNeededToRecurseInMillis is configured", () => {
      it("stops if time is not enough to process items", async () => {
        context.getRemainingTimeInMillis = () => 10000;
        await batchHandler({ timeNeededToRecurseInMillis: 10000 }).on(
          "stop",
          stopListener
        )(event, context, callback);

        expect(stopListener).toHaveBeenCalled();
      });

      it("does not stop if time is enough to process items", async () => {
        context.getRemainingTimeInMillis = () => 10001;
        await batchHandler({ timeNeededToRecurseInMillis: 10000 }).on(
          "stop",
          stopListener
        )(event, context, callback);

        expect(stopListener).not.toHaveBeenCalled();
      });
    });

    describe("when completing recursion", () => {
      it("should process all items", async done => {
        context.getRemainingTimeInMillis = () => 5000;
        const handler = batchHandler()
          .on("item", itemListener)
          .on("end", () => {
            try {
              expect(invokeMock).toHaveBeenCalledTimes(2);
              expect(itemListener).toHaveBeenCalledTimes(3);
              expect(itemListener).toHaveBeenCalledWith(
                expect.any(LaconiaContext),
                { Artist: "Foo" }
              );
              expect(itemListener).toHaveBeenCalledWith(
                expect.any(LaconiaContext),
                { Artist: "Bar" }
              );
              expect(itemListener).toHaveBeenCalledWith(
                expect.any(LaconiaContext),
                { Artist: "Fiz" }
              );
              done();
            } catch (ex) {
              done.fail(ex);
            }
          });

        invokeMock.mockImplementation(event =>
          handler(JSON.parse(event.Payload), context, callback)
        );

        handler(event, context, callback);
      });
    });
  });
};
