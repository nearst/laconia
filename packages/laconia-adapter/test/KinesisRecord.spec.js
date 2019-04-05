const KinesisRecord = require("../src/KinesisRecord");

const rawRecord = {
  kinesis: {
    kinesisSchemaVersion: "1.0",
    partitionKey: "1",
    sequenceNumber: "49590338271490256608559692538361571095921575989136588898",
    data: "SGVsbG8sIHRoaXMgaXMgYSB0ZXN0Lg==",
    approximateArrivalTimestamp: 1545084650.987
  },
  eventSource: "aws:kinesis",
  eventVersion: "1.0",
  eventID:
    "shardId-000000000006:49590338271490256608559692538361571095921575989136588898",
  eventName: "aws:kinesis:record",
  invokeIdentityArn: "arn:aws:iam::123456789012:role/lambda-kinesis-role",
  awsRegion: "us-east-2",
  eventSourceARN: "arn:aws:kinesis:us-east-2:123456789012:stream/lambda-stream"
};

const createRawRecord = data => {
  const raw = Object.assign({}, rawRecord);
  raw.kinesis = Object.assign({}, rawRecord.kinesis);
  raw.kinesis.data = data;
  return raw;
};

describe("KinesisRecord", () => {
  it("should be able to parse from raw event", async () => {
    const kinesisRecord = KinesisRecord.fromRaw(
      createRawRecord(
        Buffer.from(JSON.stringify({ foo: "bar" })).toString("base64")
      )
    );
    expect(kinesisRecord).toHaveProperty("data");
    expect(kinesisRecord.data).toBeInstanceOf(Buffer);
    expect(kinesisRecord.textData).toEqual('{"foo":"bar"}');
    expect(kinesisRecord.jsonData).toEqual({ foo: "bar" });
  });
});
