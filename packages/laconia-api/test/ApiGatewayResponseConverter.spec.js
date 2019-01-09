const ApiGatewayResponseConverter = require("../src/ApiGatewayResponseConverter");

describe("ApiGatewayResponseConverter", () => {
  let responseConverter;

  beforeEach(() => {
    responseConverter = new ApiGatewayResponseConverter();
  });

  describe("when converting an object", () => {
    it("should set body to the object's JSON string", async () => {
      const input = await responseConverter.convert({ foo: "bar" });
      expect(input).toEqual(expect.objectContaining({ body: '{"foo":"bar"}' }));
    });

    it("should set Content-Type header to application/json", async () => {
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

  describe("when converting a string", () => {
    it("should set body to the output string", async () => {
      const input = await responseConverter.convert("foo");
      expect(input).toEqual(expect.objectContaining({ body: "foo" }));
    });

    it("should set Content-Type header to text/plain", async () => {
      const input = await responseConverter.convert("foo");
      expect(input).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "text/plain"
          })
        })
      );
    });
  });
});
