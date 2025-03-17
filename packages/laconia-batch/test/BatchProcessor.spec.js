const BatchProcessor = require("../src/BatchProcessor");
const { matchers, recordTimestamps } = require("@laconia/test-helper");
const delay = require("delay");
expect.extend(matchers);

const arrayReader = array =>
  array.reduce((reader, item, index) => {
    const finished = index === array.length - 1;
    return reader.mockImplementationOnce(() =>
      Promise.resolve({ item, finished })
    );
  }, jest.fn());

describe("BatchProcessor", () => {
  let itemListener;
  let shouldStop;

  beforeEach(() => {
    itemListener = jest.fn();
    itemListener.mockImplementation(recordTimestamps(itemListener));
    shouldStop = jest.fn();
  });

  it("fires item event", async () => {
    const item = "foo";
    const batchProcessor = new BatchProcessor(
      () => Promise.resolve({ item, finished: true }),
      shouldStop
    ).on("item", itemListener);
    await batchProcessor.start();

    expect(itemListener).toBeCalledWith(item);
  });

  describe("when multiple items were returned", () => {
    beforeEach(() => {
      const batchProcessor = new BatchProcessor(
        arrayReader(["1", "2", "3"]),
        shouldStop
      ).on("item", itemListener);
      return batchProcessor.start();
    });

    it("fires multiple item events", async () => {
      expect(itemListener).toHaveBeenCalledTimes(3);
      expect(itemListener).toBeCalledWith("1");
      expect(itemListener).toBeCalledWith("2");
      expect(itemListener).toBeCalledWith("3");
    });

    it("is not rate limited by default", () => {
      expect(itemListener).toBeCalledWithGapBetween(0, 5);
    });
  });

  describe("when an undefined item is returned", () => {
    it("should not fire item event", async () => {
      const batchProcessor = new BatchProcessor(
        arrayReader(["1", undefined, "3"]),
        shouldStop
      ).on("item", itemListener);
      await batchProcessor.start();

      expect(itemListener).toHaveBeenCalledTimes(2);
    });
  });

  describe("when rate limited", () => {
    const createBatchProcessor = itemsPerSecond =>
      new BatchProcessor(arrayReader(["1", "2", "3"]), shouldStop, {
        itemsPerSecond
      }).on("item", itemListener);

    it("should process items with delay", async () => {
      const batchProcessor = createBatchProcessor(50);
      await batchProcessor.start();

      expect(itemListener).toBeCalledWithGapBetween(3, 75);
    });

    describe("and the item listener is as slow as the rate limit", () => {
      beforeEach(() => {
        itemListener.mockImplementation(() => {
          recordTimestamps(itemListener)();
          return delay(50);
        });
      });

      it("processes the items with the configured delay", async () => {
        const batchProcessor = createBatchProcessor(50);
        await batchProcessor.start();

        expect(itemListener).toBeCalledWithGapBetween(3, 75);
      });
    });

    describe("and the item listener is as slower than the rate limit", () => {
      beforeEach(() => {
        itemListener.mockImplementation(() => {
          recordTimestamps(itemListener)();
          return delay(100);
        });
      });

      it("processes the items by the speed of the listener", async () => {
        const batchProcessor = createBatchProcessor(50);
        await batchProcessor.start();

        expect(itemListener).toBeCalledWithGapBetween(90, 150);
      });
    });
  });
});
