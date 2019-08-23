const event = require("../src/index");

describe("index", () => {
  const eventParsers = ["s3", "kinesis", "sns", "sqs"];

  eventParsers.forEach(eventParser => {
    describe(`#${eventParser}`, () => {
      it(`exposes ${eventParser} parser`, () => {
        expect(event[eventParser]).toBeFunction();
      });
    });
  });

  describe("#apigateway", () => {
    it("exposes an object that has req and res", () => {
      expect(event.apigateway).toHaveProperty("req", expect.toBeFunction());
      expect(event.apigateway).toHaveProperty("res", expect.toBeFunction());
    });
  });
});
