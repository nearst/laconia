const event = require("../src/index");

describe("index", () => {
  const eventParsers = ["s3", "kinesis", "sns", "sqs", "dynamodb"];

  eventParsers.forEach(eventParser => {
    describe(`#${eventParser}`, () => {
      it(`exposes ${eventParser} parser`, () => {
        expect(event[eventParser]).toBeInstanceOf(Function);
      });
    });
  });

  describe("#apigateway", () => {
    it("exposes an object that has req and res", () => {
      expect(event.apigateway).toHaveProperty(
        "req",
        expect.toBeInstanceOf(Function)
      );
      expect(event.apigateway).toHaveProperty(
        "res",
        expect.toBeInstanceOf(Function)
      );
    });
  });
});
