const S3EventAdapter = require("../src/S3EventAdapter");

describe("S3EventAdapter", () => {
  let event;
  let inputConverter;
  let app;
  let laconiaContext;

  beforeEach(() => {
    event = { foo: "event" };
    inputConverter = { convert: jest.fn() };
    app = jest.fn();
    laconiaContext = { dependency: "some dependencies " };
  });

  it("should call inputConverter", async () => {
    const adapter = new S3EventAdapter(app, inputConverter);
    await adapter.handle(event, laconiaContext);
    expect(inputConverter.convert).toBeCalledWith(event);
  });

  it("should inject $s3 instance retrieved from laconiaContext", async () => {
    laconiaContext.$s3 = "s3 object";
    const adapter = new S3EventAdapter(app, inputConverter);
    await adapter.handle(event, laconiaContext);
    expect(inputConverter).toHaveProperty("s3", "s3 object");
  });
});
