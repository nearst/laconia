const createS3EventAdapter = require("../src/createS3EventAdapter");
const S3JsonInputConverter = require("../src/S3JsonInputConverter");
const S3StreamInputConverter = require("../src/S3StreamInputConverter");
const S3EventInputConverter = require("../src/S3EventInputConverter");

describe("createS3EventAdapter", () => {
  it("returns an adapter function", () => {
    const adapter = createS3EventAdapter()();
    expect(adapter).toBeFunction();
  });

  it("is created with S3JsonInputConverter when inputType is object", () => {
    const adapter = createS3EventAdapter({
      inputType: "object",
      functional: false
    })(jest.fn());
    expect(adapter.inputConverter).toBeInstanceOf(S3JsonInputConverter);
  });

  it("is created with S3StreamInputConverter when inputType is stream", () => {
    const adapter = createS3EventAdapter({
      inputType: "stream",
      functional: false
    })(jest.fn());
    expect(adapter.inputConverter).toBeInstanceOf(S3StreamInputConverter);
  });

  it("is created with S3EventInputConverter when inputType is event", () => {
    const adapter = createS3EventAdapter({
      inputType: "event",
      functional: false
    })(jest.fn());
    expect(adapter.inputConverter).toBeInstanceOf(S3EventInputConverter);
  });

  it("throws an error when inputType is not supported", () => {
    expect(() =>
      createS3EventAdapter({
        inputType: "unsupported",
        functional: false
      })(jest.fn())
    ).toThrow("Unsupported inputType");
  });
});
