const createEvent = require("aws-event-mocks");
const SqsJsonInputConverter = require("../src/SqsJsonInputConverter");

const createSqsEvent = messages => {
  return createEvent({
    template: "aws:sqs",
    merge: {
      Records: messages.map(m => ({ body: JSON.stringify(m) }))
    }
  });
};

describe("SqsJsonInputConverter", () => {
  it("should convert one record event to json", async () => {
    const inputConverter = new SqsJsonInputConverter();
    const input = await inputConverter.convert(
      createSqsEvent([{ foo: "bar" }])
    );
    expect(input).toEqual([{ foo: "bar" }]);
  });

  it("should convert multiple records event to json", async () => {
    const inputConverter = new SqsJsonInputConverter();
    const input = await inputConverter.convert(
      createSqsEvent([{ foo: "bar" }, "message"])
    );
    expect(input).toEqual([{ foo: "bar" }, "message"]);
  });
});
