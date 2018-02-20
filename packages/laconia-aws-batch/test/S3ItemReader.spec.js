/* eslint-env jest */
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const S3ItemReader = require("../src/S3ItemReader");

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

  it("retrieves next item when path given is an array of 3 items", async () => {
    s3.getObject.mockImplementation(s3Body(["Foo", "Bar", "Fiz"]));
    const reader = new S3ItemReader(new AWS.S3(), s3Params, ".");
    let next = await reader.next();
    expect(next).toEqual({
      item: "Foo",
      cursor: { index: 0 },
      finished: false
    });

    next = await reader.next(next.cursor);
    expect(next).toEqual({
      item: "Bar",
      cursor: { index: 1 },
      finished: false
    });

    next = await reader.next(next.cursor);
    expect(next).toEqual({ item: "Fiz", cursor: { index: 2 }, finished: true });
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

  it("caches result");

  describe("when path given is not an array", () => {
    it("throw error");
  });
});
