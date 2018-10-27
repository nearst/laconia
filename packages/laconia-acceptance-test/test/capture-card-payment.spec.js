const handler = require("../src/capture-card-payment").handler;

describe("capture-card-payment", () => {
  let event;

  beforeEach(() => {
    event = { paymentReference: "boo" };
  });

  it("throws error if paymentReference is not defined", async () => {
    event = {};
    await expect(handler.run(event)).rejects.toThrow(
      "paymentReference is required"
    );
  });
});
