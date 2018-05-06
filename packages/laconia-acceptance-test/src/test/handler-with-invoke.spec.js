const handler = require("./handler-with-invoke").handler;

describe("handler-with-invoke", () => {
  it("should invoke hello lambda", async () => {
    const laconiaContext = {
      event: {
        payload: "data"
      },
      hello: {
        requestResponse: jest.fn().mockReturnValue(Promise.resolve("result"))
      }
    };
    const response = await handler.run(laconiaContext);

    expect(response).toEqual("result");
    expect(laconiaContext.hello.requestResponse).toBeCalledWith("data");
  });
});
