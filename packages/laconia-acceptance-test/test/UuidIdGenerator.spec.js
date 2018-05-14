const UuidIdGenerator = require("../src/UuidIdGenerator");

describe("UuidIdGenerator", () => {
  it("should generate different ID on multiple calls", async () => {
    const idGenerator = new UuidIdGenerator();

    const id1 = idGenerator.generate();
    const id2 = idGenerator.generate();

    expect(id1).not.toEqual(id2);
  });
});
