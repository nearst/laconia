const app = require("../src/capture-card-payment").app;

describe("capture-card-payment", () => {
  let event;

  beforeEach(() => {
    event = { paymentReference: "boo" };
  });

  it("throws error if paymentReference is not defined", async () => {
    event = {};
    await expect(app(event)).rejects.toThrow("paymentReference is required");
  });
});
