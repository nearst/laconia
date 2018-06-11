const handler = require("../src/capture-card-payment").handler;

describe("capture-card-payment", () => {
  let tracker, event;

  beforeEach(() => {
    tracker = { tick: jest.fn() };
    event = { something: "boo" };
  });

  it("captures the entire event as card payment", async () => {
    await handler.run({ tracker, event });

    expect(tracker.tick).toBeCalledWith(event);
  });
});
