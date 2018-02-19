/* eslint-env jest */
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const S3ItemReader = require("../src/S3ItemReader");

const yields = arg => (params, callback) => callback(null, arg);

const s3Body = object => ({
  Body: {
    toString: () => JSON.stringify(object)
  }
});

describe("S3 Item Reader", () => {
  xdescribe("when path given is an array of 1 item", () => {
    beforeEach(() => {
      const s3 = {
        getObject: jest.fn().mockImplementation(
          yields(
            s3Body({
              music: {
                list: [{ Artist: "Foo" }]
              }
            })
          )
        )
      };

      AWSMock.mock("S3", "getObject", s3.getObject);
    });

    it("should be able to get next items", async () => {
      const reader = new S3ItemReader(
        new AWS.S3(),
        { Bucket: "bucket", Key: "key" },
        "music.list"
      );
      let next = await reader.next();

      expect(next).toEqual({
        item: { Artist: "Foo" },
        cursor: { index: 0 },
        finished: true
      });
    });
  });

  describe("when path given is an array of 3 items", () => {
    beforeEach(() => {
      const s3 = {
        getObject: jest.fn().mockImplementation(
          yields(
            s3Body({
              music: {
                list: [{ Artist: "Foo" }, { Artist: "Bar" }, { Artist: "Fiz" }]
              }
            })
          )
        )
      };

      AWSMock.mock("S3", "getObject", s3.getObject);
    });

    it("should be able to get next items", async () => {
      const reader = new S3ItemReader(
        new AWS.S3(),
        { Bucket: "bucket", Key: "key" },
        "music.list"
      );
      let next = await reader.next();

      expect(next).toEqual({
        item: { Artist: "Foo" },
        cursor: { index: 0 },
        finished: false
      });

      next = await reader.next(next.cursor);
      expect(next).toEqual({
        item: { Artist: "Bar" },
        cursor: { index: 1 },
        finished: false
      });

      next = await reader.next(next.cursor);
      expect(next).toEqual({
        item: { Artist: "Fiz" },
        cursor: { index: 2 },
        finished: true
      });
    });
  });

  it("should be able to handle various paths");
  describe("when path given is not an array", () => {
    it("throw error");
  });
});
