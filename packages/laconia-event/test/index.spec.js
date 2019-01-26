const createLaconiaEventHandler = require("../src/createLaconiaEventHandler");
const event = require("../src/index");

jest.mock("../src/createLaconiaEventHandler");

describe("@laconia/event", () => {
  it("exposes s3 adapter", () => {
    expect(event.s3).toBeFunction();
  });

  const eventHandlers = ["kinesisJson", "snsJson", "sqsJson"];

  beforeEach(() => {
    createLaconiaEventHandler.mockReset();
  });

  eventHandlers.forEach(eventHandler => {
    describe(`#${eventHandler}`, () => {
      it(`has ${eventHandler} event handler`, () => {
        expect(event[eventHandler]).toBeFunction();
      });

      it(`should be created with a factory that returns an input converter`, () => {
        event[eventHandler]();

        expect(createLaconiaEventHandler).toBeCalled();
        const inputConverterFactory =
          createLaconiaEventHandler.mock.calls[0][0];
        const inputConverter = inputConverterFactory({});
        expect(inputConverter).toHaveProperty("convert");
      });
    });
  });
});
