const merge = require("lodash/merge");
const KinesisEvent = require("../src/KinesisEvent");
const KinesisRecord = require("../src/KinesisRecord");
const kinesisTemplate = require("aws-event-mocks/events/aws/kinesis.json");

const createKinesisEvent = records => {
  return merge({}, kinesisTemplate, {
    Records: records.map(r => ({
      kinesis: {
        data: Buffer.from(JSON.stringify(r)).toString("base64")
      }
    }))
  });
};

describe("KinesisEvent", () => {
  describe("#records", () => {
    it("should parse a single record", async () => {
      const kinesisEvent = KinesisEvent.fromEvent(
        createKinesisEvent(["foo bar"])
      );
      expect(kinesisEvent.records).toHaveLength(1);
      expect(kinesisEvent.records[0]).toBeInstanceOf(KinesisRecord);
    });

    it("should parse multiple records ", async () => {
      const kinesisEvent = KinesisEvent.fromEvent(
        createKinesisEvent(["foo bar", { foo: "bar" }])
      );
      expect(kinesisEvent.records).toHaveLength(2);
      expect(kinesisEvent.records[0].textData).toEqual('"foo bar"');
      expect(kinesisEvent.records[1].jsonData).toEqual({ foo: "bar" });
    });
  });
});
