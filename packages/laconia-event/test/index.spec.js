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
});
