const createEvent = require("aws-event-mocks");
const SqsEvent = require("../src/SqsEvent");
const SqsRecord = require("../src/SqsRecord");

const createSqsEvent = messages => {
  return createEvent({
    template: "aws:sqs",
    merge: {
      Records: messages.map(m => ({ body: JSON.stringify(m) }))
    }
  });
};

describe("SqsEvent", () => {
  it("should convert one record event to json", async () => {
    const sqsEvent = SqsEvent.fromRaw(createSqsEvent([{ foo: "bar" }]));
    expect(sqsEvent.records).toHaveLength(1);
    expect(sqsEvent.records[0]).toBeInstanceOf(SqsRecord);
    expect(sqsEvent.records[0].body).toEqual({ foo: "bar" });
  });

  it("should convert multiple records event to json", async () => {
    const sqsEvent = SqsEvent.fromRaw(
      createSqsEvent([{ foo: "bar" }, { fiz: "baz" }])
    );
    expect(sqsEvent.records).toHaveLength(2);
    expect(sqsEvent.records[0].body).toEqual({ foo: "bar" });
    expect(sqsEvent.records[1].body).toEqual({ fiz: "baz" });
  });
});
