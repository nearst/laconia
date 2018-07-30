const spy = require("../src/spy");

describe("spy", () => {
  let lc;
  let lower;
  let spyerFactory;
  let spyer;

  beforeEach(() => {
    lower = jest.fn().mockResolvedValue("result");
    spyer = { track: jest.fn() };
    spyerFactory = { makeSpy: jest.fn().mockReturnValue(spyer) };
    lc = { event: "event", $spyerFactory: spyerFactory };
  });

  it("should call the lower order function", async () => {
    spy(lower)(lc);
    expect(lower).toBeCalledWith(lc);
  });

  it("should delegate the return value of the lower order function", async () => {
    const result = await spy(lower)(lc);
    expect(result).toEqual("result");
  });

  it("should create a new spy by calling spy factory", async () => {
    spy(lower)(lc);
    expect(spyerFactory.makeSpy).toBeCalled();
  });

  it("should spy lower order function after it is called", async () => {
    await spy(lower)(lc);
    expect(spyer.track).toBeCalledWith(lc);
  });

  it("should throw error when lower throws an error", async () => {
    lower.mockRejectedValue(new Error("boom"));
    await expect(spy(lower)(lc)).rejects.toThrow("boom");
  });

  it("should track event even when lower throws an error", async () => {
    lower.mockRejectedValue(new Error("boom"));
    await expect(spy(lower)(lc)).rejects.toThrow();
    expect(spyer.track).toBeCalledWith(lc);
  });
});
