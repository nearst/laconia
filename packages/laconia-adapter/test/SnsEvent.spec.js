const createEvent = require("aws-event-mocks");
const SnsEvent = require("../src/SnsEvent");

const createSnsEvent = message => {
  return createEvent({
    template: "aws:sns",
    merge: {
      Records: [
        {
          Sns: {
            Subject: "the subject",
            Message: message
          }
        }
      ]
    }
  });
};

describe("SnsEvent", () => {
  describe("#message", () => {
    it("should be able to parse from raw event", async () => {
      const snsEvent = SnsEvent.fromRaw(createSnsEvent("plain text"));
      expect(snsEvent.message).toEqual("plain text");
      expect(snsEvent.subject).toEqual("the subject");
    });

    it("should automatically parse JSON", async () => {
      const snsEvent = SnsEvent.fromRaw(
        createSnsEvent(JSON.stringify({ foo: "bar" }))
      );
      expect(snsEvent.message).toEqual({ foo: "bar" });
    });
  });
});
