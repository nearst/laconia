const getContentType = require("../src/getContentType");

describe("getContentType", () => {
  it("should return application/json when an object is specified", async () => {
    const contentType = await getContentType({ foo: "bar" });
    expect(contentType).toEqual("application/json; charset=utf-8");
  });

  it("should return text/plain when a string is specified", async () => {
    const contentType = await getContentType("foo");
    expect(contentType).toEqual("text/plain");
  });

  it("should return text/plain when a number is specified", async () => {
    const contentType = await getContentType(4);
    expect(contentType).toEqual("text/plain");
  });
});
