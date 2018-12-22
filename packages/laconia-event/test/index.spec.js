const event = require("../src/index");

describe("@laconia/event", () => {
  const eventHandlers = [
    "s3Event",
    "s3Stream",
    "kinesisJson",
    "s3Json",
    "snsJson",
    "sqsJson"
  ];

  eventHandlers.forEach(eventHandler => {
    it(`has ${eventHandler} event handler`, () => {
      expect(event[eventHandler]).toBeFunction();
    });
  });
});
