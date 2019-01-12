const index = require("../src/index");
const createLaconiaApiHandler = require("../src/createLaconiaApiHandler");

jest.mock("../src/createLaconiaApiHandler");

describe("laconiaApi", () => {
  beforeEach(() => {
    createLaconiaApiHandler.mockReset();
  });

  const eventHandlers = ["params", "body"];

  eventHandlers.forEach(eventHandler => {
    describe(`#${eventHandler}`, () => {
      it(`has ${eventHandler} event handler`, () => {
        expect(index[eventHandler]).toBeFunction();
      });

      it("should create event handler with the specified options", () => {
        const options = { opt: "value" };
        index[eventHandler](options);
        expect(createLaconiaApiHandler).toBeCalledWith(
          expect.anything(),
          expect.anything(),
          options
        );
      });

      it(`should be created with a factory that returns an input converter`, () => {
        index[eventHandler]();

        expect(createLaconiaApiHandler).toBeCalled();
        const inputConverterFactory = createLaconiaApiHandler.mock.calls[0][0];
        const inputConverter = inputConverterFactory({});
        expect(inputConverter).toHaveProperty("convert");
      });

      it(`should be created with a factory that returns an output converter`, () => {
        index[eventHandler]();

        expect(createLaconiaApiHandler).toBeCalled();
        const responseConverterFactory =
          createLaconiaApiHandler.mock.calls[0][1];
        const responseConverter = responseConverterFactory({});
        expect(responseConverter).toHaveProperty("convert");
      });
    });
  });
});
