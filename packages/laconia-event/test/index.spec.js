const event = require("../src/index");

describe("@laconia/event", () => {
  const eventAdapters = ["s3", "kinesis", "sns", "sqs"];

  eventAdapters.forEach(eventAdapter => {
    describe(`#${eventAdapter}`, () => {
      it(`exposes ${eventAdapter} adapter`, () => {
        expect(event[eventAdapter]).toBeFunction();
      });
    });
  });
});
