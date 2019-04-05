const createEvent = require("aws-event-mocks");
const SnsEvent = require("../src/SnsEvent");

const createSnsEvent = message => {
  return createEvent({
    template: "aws:sns",
    merge: {
      Records: [
        {
          Sns: {
            Message: message
          }
        }
      ]
    }
  });
};

describe("SnsEvent", () => {
  describe("#message", () => {
    it("should parse message to JSON", async () => {
      const snsEvent = SnsEvent.fromRaw(
        createSnsEvent(JSON.stringify({ foo: "bar" }))
      );
      expect(snsEvent.message).toEqual({ foo: "bar" });
    });
  });

  describe("#message", () => {
    it("should return message as is", async () => {
      const snsEvent = SnsEvent.fromRaw(createSnsEvent("plain text"));
      expect(snsEvent.message).toEqual("plain text");
    });
  });
});
