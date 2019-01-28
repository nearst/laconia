const createEvent = require("aws-event-mocks");
const KinesisJsonInputConverter = require("../src/KinesisJsonInputConverter");

const createKinesisEvent = records => {
  return createEvent({
    template: "aws:kinesis",
    merge: {
      Records: records.map(r => ({
        kinesis: {
          data: Buffer.from(JSON.stringify(r)).toString("base64")
        }
      }))
    }
  });
};

describe("KinesisJsonInputConverter", () => {
  it("should convert one record event to json", async () => {
    const inputConverter = new KinesisJsonInputConverter();
    const input = await inputConverter.convert(createKinesisEvent(["foo bar"]));
    expect(input).toEqual(["foo bar"]);
  });

  it("should convert multiple records event to json", async () => {
    const inputConverter = new KinesisJsonInputConverter();
    const input = await inputConverter.convert(
      createKinesisEvent(["foo bar", { foo: "bar" }])
    );
    expect(input).toEqual(["foo bar", { foo: "bar" }]);
  });
});
