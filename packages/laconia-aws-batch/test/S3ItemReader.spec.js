/* eslint-env jest */
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const S3ItemReader = require("../src/S3ItemReader");
const _ = require("lodash");

const yields = arg => (params, callback) => callback(null, arg);

const s3Body = object =>
  yields({
    Body: {
      toString: () => JSON.stringify(object)
    }
  });

describe("S3 Item Reader", () => {
  let s3;

  const s3Params = { Bucket: "bucket", Key: "key" };

  beforeEach(() => {
    s3 = { getObject: jest.fn() };
    AWSMock.mock("S3", "getObject", s3.getObject);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it("retrieves a directly stored array", async () => {
    s3.getObject.mockImplementation(s3Body(["Foo"]));
    const reader = new S3ItemReader(new AWS.S3(), s3Params, ".");
    let next = await reader.next();

    expect(next).toEqual({ item: "Foo", cursor: { index: 0 }, finished: true });
  });

  it("retrieves next item when path given is an array of 1 item", async () => {
    s3.getObject.mockImplementation(s3Body(["Foo"]));
    const reader = new S3ItemReader(new AWS.S3(), s3Params, ".");
    let next = await reader.next();

    expect(next).toEqual({ item: "Foo", cursor: { index: 0 }, finished: true });
  });

  it("retrieves array from a simple object path", async () => {
    s3.getObject.mockImplementation(
      s3Body({
        list: ["Foo"]
      })
    );
    const reader = new S3ItemReader(new AWS.S3(), s3Params, "list");
    let next = await reader.next();

    expect(next).toHaveProperty("item", "Foo");
  });

  it("retrieves array from a complex object path", async () => {
    s3.getObject.mockImplementation(
      s3Body({
        database: {
          music: [
            {
              category: {
                list: ["Foo"]
              }
            }
          ]
        }
      })
    );
    const reader = new S3ItemReader(
      new AWS.S3(),
      s3Params,
      'database.music[0]["category"].list'
    );
    let next = await reader.next();

    expect(next).toHaveProperty("item", "Foo");
  });

  describe("when multiple items are returned", () => {
    let nexts;

    beforeEach(async () => {
      nexts = [];
      s3.getObject.mockImplementation(s3Body(["Foo", "Bar", "Fiz"]));
      const reader = new S3ItemReader(new AWS.S3(), s3Params, ".");
      nexts.push(await reader.next());
      nexts.push(await reader.next(_.last(nexts).cursor));
      nexts.push(await reader.next(_.last(nexts).cursor));
    });

    it("generates nexts object with the correct content", async () => {
      expect(nexts[0]).toEqual({
        item: "Foo",
        cursor: { index: 0 },
        finished: false
      });
      expect(nexts[1]).toEqual({
        item: "Bar",
        cursor: { index: 1 },
        finished: false
      });
      expect(nexts[2]).toEqual({
        item: "Fiz",
        cursor: { index: 2 },
        finished: true
      });
    });

    it("caches S3 result", async () => {
      expect(s3.getObject).toHaveBeenCalledTimes(1);
    });
  });

  describe("when start reading in the middle", () => {
    let nexts;

    beforeEach(async () => {
      nexts = [];
      s3.getObject.mockImplementation(
        s3Body(["1", "2", "3", "Foo", "Bar", "Fiz"])
      );
      const reader = new S3ItemReader(new AWS.S3(), s3Params, ".");
      nexts.push(await reader.next({ index: 2 }));
      nexts.push(await reader.next(_.last(nexts).cursor));
      nexts.push(await reader.next(_.last(nexts).cursor));
    });

    it("generates nexts object with the correct content", async () => {
      expect(nexts[0]).toEqual({
        item: "Foo",
        cursor: { index: 3 },
        finished: false
      });
      expect(nexts[1]).toEqual({
        item: "Bar",
        cursor: { index: 4 },
        finished: false
      });
      expect(nexts[2]).toEqual({
        item: "Fiz",
        cursor: { index: 5 },
        finished: true
      });
    });

    it("caches S3 result", async () => {
      expect(s3.getObject).toHaveBeenCalledTimes(1);
    });
  });

  describe("when given path is not an array", () => {
    const nonArrays = [
      { name: "string", value: "Foo" },
      { name: "object", value: { foo: "Foo" } },
      { name: "null", value: null },
      { name: "number", value: 1.0 }
    ];

    nonArrays.forEach(({ name, value, path }) => {
      it(`throws error when ${name} is found`, async () => {
        s3.getObject.mockImplementation(s3Body(value));
        const reader = new S3ItemReader(new AWS.S3(), s3Params, ".");
        await expect(reader.next()).rejects.toThrow(JSON.stringify(value));
      });
    });

    it(`throws error when undefined is found`, async () => {
      s3.getObject.mockImplementation(s3Body("not used"));
      const reader = new S3ItemReader(new AWS.S3(), s3Params, "non existent");
      await expect(reader.next()).rejects.toThrow("undefined");
    });
  });

  it("throws error when path given Body is not a JSON", async () => {
    s3.getObject.mockImplementation(
      yields({
        Body: { toString: () => "boom" }
      })
    );
    const reader = new S3ItemReader(new AWS.S3(), s3Params, ".");
    await expect(reader.next()).rejects.toThrow("not a JSON");
  });
});
