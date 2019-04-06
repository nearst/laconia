const SqsRecord = require("../src/SqsRecord");

const rawRecord = {
  messageId: "059f36b4-87a3-44ab-83d2-661975830a7d",
  receiptHandle: "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a",
  body: "test",
  attributes: {
    ApproximateReceiveCount: "1",
    SentTimestamp: "1545082649183",
    SenderId: "AIDAIENQZJOLO23YVJ4VO",
    ApproximateFirstReceiveTimestamp: "1545082649185"
  },
  messageAttributes: {},
  md5OfBody: "098f6bcd4621d373cade4e832627b4f6",
  eventSource: "aws:sqs",
  eventSourceARN: "arn:aws:sqs:us-east-2:123456789012:my-queue",
  awsRegion: "us-east-2"
};

describe("SqsRecord", () => {
  it("should be able to parse from raw event", async () => {
    const sqsRecord = SqsRecord.fromRaw(rawRecord);
    expect(sqsRecord).toHaveProperty("receiptHandle", rawRecord.receiptHandle);
    expect(sqsRecord).toHaveProperty("body", rawRecord.body);
  });

  it("should automatically parse JSON", async () => {
    const sqsRecord = SqsRecord.fromRaw(
      Object.assign({}, rawRecord, { body: JSON.stringify({ foo: "bar" }) })
    );
    expect(sqsRecord).toHaveProperty("body", { foo: "bar" });
  });
});
