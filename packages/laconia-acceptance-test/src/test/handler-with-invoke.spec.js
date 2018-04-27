const handler = require("./handler-with-invoke");

describe("handler-with-invoke", () => {
  xit("should invoke hello lambda", async () => {
    const laconiaContext = {
      event: {
        payload: "data"
      },
      invoke: {
        requestResponse: jest.fn().mockReturnValue(Promise.resolve("result"))
      }
    };
    const response = await handler.run(laconiaContext);

    expect(response).toEqual("result");
    expect(laconiaContext.invoke.requestResponse).toBeCalledWith("data");
  });
});
