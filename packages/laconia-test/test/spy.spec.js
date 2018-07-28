const spy = require("../src/spy");

describe("spy", () => {
  let lc;
  let lower;
  let spyFactory;

  beforeEach(() => {
    lower = jest.fn().mockResolvedValue("result");
    spyFactory = { makeSpy: jest.fn() };
    lc = { event: "event", $spyFactory: spyFactory };
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
    const lower = jest.fn().mockResolvedValue("result");
    spy(lower)(lc);
    expect(spyFactory.makeSpy).toBeCalledWith(lc);
  });
});
