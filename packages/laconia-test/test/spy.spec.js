const spy = require("../src/spy");

describe("spy", () => {
  let lc;
  let input;
  let lower;
  let spierFactory;
  let spier;

  beforeEach(() => {
    lower = jest.fn().mockResolvedValue("result");
    spier = { track: jest.fn() };
    spierFactory = { makeSpier: jest.fn().mockReturnValue(spier) };
    input = "event";
    lc = { $spierFactory: spierFactory };
  });

  it("should call the lower order function", async () => {
    await spy(lower)(input, lc);
    expect(lower).toBeCalledWith(input, lc);
  });

  it("should delegate the return value of the lower order function", async () => {
    const result = await spy(lower)(input, lc);
    expect(result).toEqual("result");
  });

  it("should create a new spy by calling spy factory", async () => {
    await spy(lower)(input, lc);
    expect(spierFactory.makeSpier).toBeCalled();
  });

  it("should spy lower order function after it is called", async () => {
    await spy(lower)(input, lc);
    expect(spier.track).toBeCalledWith(lc);
  });

  it("should throw error when lower throws an error", async () => {
    lower.mockRejectedValue(new Error("boom"));
    await expect(spy(lower)(input, lc)).rejects.toThrow("boom");
  });

  it("should track event even when lower throws an error", async () => {
    lower.mockRejectedValue(new Error("boom"));
    await expect(spy(lower)(input, lc)).rejects.toThrow();
    expect(spier.track).toBeCalledWith(lc);
  });

  describe("instances", () => {
    it("should be able to retrieve $spierFactory", () => {
      const result = spy.instances({
        env: {
          LACONIA_TEST_SPY_BUCKET: "bucket"
        }
      })();
      expect(result).toHaveProperty("$spierFactory");
    });
  });
});
