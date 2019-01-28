const event = require("../src/index");

describe("@laconia/adapter", () => {
  const eventAdapters = ["s3", "kinesis", "sns", "sqs"];

  eventAdapters.forEach(eventAdapter => {
    describe(`#${eventAdapter}`, () => {
      it(`exposes ${eventAdapter} adapter`, () => {
        expect(event[eventAdapter]).toBeFunction();
      });
    });
  });
});
