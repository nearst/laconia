const merge = require("lodash/merge");
const KinesisEvent = require("../src/KinesisEvent");
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
  describe("#jsonRecords", () => {
    it("should parse the JSON string", async () => {
      const kinesisEvent = KinesisEvent.fromEvent(
        createKinesisEvent(["foo bar"])
      );
      expect(kinesisEvent.jsonRecords).toEqual(["foo bar"]);
    });

    it("should return multiple records event to json", async () => {
      const kinesisEvent = KinesisEvent.fromEvent(
        createKinesisEvent(["foo bar", { foo: "bar" }])
      );
      expect(kinesisEvent.jsonRecords).toEqual(["foo bar", { foo: "bar" }]);
    });
  });

  describe("#stringRecords", () => {
    it("should return the original record published to Kinesis", async () => {
      const kinesisEvent = KinesisEvent.fromEvent(
        createKinesisEvent([{ foo: "bar" }])
      );
      expect(kinesisEvent.stringRecords).toEqual(['{"foo":"bar"}']);
    });

    it("should return multiple records event to string", async () => {
      const kinesisEvent = KinesisEvent.fromEvent(
        createKinesisEvent([{ foo: "bar" }, { fiz: "baz" }])
      );
      expect(kinesisEvent.stringRecords).toEqual([
        '{"foo":"bar"}',
        '{"fiz":"baz"}'
      ]);
    });
  });

  describe("#bufferRecords", () => {
    it("should return the raw record", async () => {
      const kinesisEvent = KinesisEvent.fromEvent(
        createKinesisEvent([{ foo: "bar" }])
      );
      expect(kinesisEvent.bufferRecords[0]).toBeInstanceOf(Buffer);
    });
  });
});
