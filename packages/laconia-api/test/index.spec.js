const index = require("../src/index");
const createLaconiaApiHandler = require("../src/createLaconiaApiHandler");

jest.mock("../src/createLaconiaApiHandler");

describe("laconiaApi", () => {
  it("exports a function", () => {
    expect(index).toBeFunction();
  });

  const eventHandlers = ["params"];

  eventHandlers.forEach(eventHandler => {
    describe(`#${eventHandler}`, () => {
      it(`has ${eventHandler} event handler`, () => {
        expect(index[eventHandler]).toBeFunction();
      });

      it(`should be created with a factory that returns an input converter`, () => {
        index[eventHandler]();

        expect(createLaconiaApiHandler).toBeCalled();
        const inputConverterFactory = createLaconiaApiHandler.mock.calls[0][0];
        const inputConverter = inputConverterFactory({});
        expect(inputConverter).toHaveProperty("convert");
      });
    });
  });
});
