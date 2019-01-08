const ApiGatewayResponseConverter = require("../src/ApiGatewayResponseConverter");

describe("ApiGatewayResponseConverter", () => {
  let responseConverter;

  beforeEach(() => {
    responseConverter = new ApiGatewayResponseConverter();
  });

  it("should JSON stringify when converting an object", async () => {
    const input = await responseConverter.convert({ foo: "bar" });
    expect(input).toEqual(expect.objectContaining({ body: '{"foo":"bar"}' }));
  });

  it("should return Content-Type of application/json when converting an object", async () => {
    const input = await responseConverter.convert({ foo: "bar" });
    expect(input).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json; charset=utf-8"
        })
      })
    );
  });
});
