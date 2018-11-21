const createEvent = require("aws-event-mocks");
const SnsJsonInputConverter = require("../src/SnsJsonInputConverter");

const createSnsEvent = body => {
  return createEvent({
    template: "aws:sns",
    merge: {
      Records: [
        {
          Sns: {
            Message: JSON.stringify(body)
          }
        }
      ]
    }
  });
};

describe("SnsJsonInputConverter", () => {
  it("should convert one record event to json", async () => {
    const inputConverter = new SnsJsonInputConverter();
    const input = await inputConverter.convert(createSnsEvent({ foo: "bar" }));
    expect(input).toEqual({ foo: "bar" });
  });
});
