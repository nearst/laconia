const handler = require("../src/process-card-payments").handler;

describe("process-card-payments", () => {
  it("triggers capture card payment lambda on item event", async () => {
    const captureCardPayment = { fireAndForget: jest.fn() };
    const item = { paymentReference: "something" };
    handler.emit("item", { captureCardPayment }, item);

    expect(captureCardPayment.fireAndForget).toBeCalledWith({
      paymentReference: "something"
    });
  });
});
