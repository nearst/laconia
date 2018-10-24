const AWSSDK = require("aws-sdk");
const AWS = require("aws-sdk-mock");
const { yields, s3Body } = require("@laconia/test-helper");
const S3Converter = require("../src/S3Converter");

describe("S3Converter", () => {
  let s3;
  let awsS3;

  afterEach(() => {
    AWS.restore();
  });

  beforeEach(() => {
    s3 = {
      getObject: jest
        .fn()
        .mockImplementation(s3Body({ applicationName: "hello" }))
    };
    AWS.mock("S3", "getObject", s3.getObject);
    awsS3 = new AWSSDK.S3();
  });

  describe("when there is no env var set", () => {
    let s3Converter;

    beforeEach(() => {
      s3Converter = new S3Converter(awsS3);
    });

    it("return empty instances", async () => {
      const instances = await s3Converter.convertMultiple({});
      expect(instances).toEqual({});
    });

    it("should not call S3", async () => {
      await s3Converter.convertMultiple({});
      expect(s3.getObject).not.toBeCalled();
    });
  });

  describe("when there is one value", () => {
    let s3Converter;
    let values;

    beforeEach(() => {
      s3Converter = new S3Converter(awsS3);
      values = {
        myConf: "mybucket/nested/name.json"
      };
    });

    it("should call S3 with the specified value", async () => {
      await s3Converter.convertMultiple(values);
      expect(s3.getObject).toBeCalledWith(
        {
          Bucket: "mybucket",
          Key: "nested/name.json"
        },
        expect.any(Function)
      );
    });

    it("should return app config instance", async () => {
      const instances = await s3Converter.convertMultiple(values);
      expect(instances).toHaveProperty("myConf", { applicationName: "hello" });
    });
  });

  describe("when there is multiple values specified", () => {
    let s3Converter;
    let values;

    beforeEach(() => {
      values = {
        myConf: "mybucket/nested/name.json",
        otherConf: "otherbucket/nested/bar/other.json"
      };
      s3Converter = new S3Converter(awsS3);

      s3.getObject.mockImplementation(
        yields(({ Bucket }) => {
          return {
            Body: JSON.stringify(
              Bucket === "mybucket"
                ? { applicationName: "hello" }
                : { username: "admin" }
            )
          };
        })
      );
    });

    it("should call S3 with the configured env var value", async () => {
      await s3Converter.convertMultiple(values);
      expect(s3.getObject).toHaveBeenCalledTimes(2);
      expect(s3.getObject).toBeCalledWith(
        {
          Bucket: "mybucket",
          Key: "nested/name.json"
        },
        expect.any(Function)
      );
      expect(s3.getObject).toBeCalledWith(
        {
          Bucket: "otherbucket",
          Key: "nested/bar/other.json"
        },
        expect.any(Function)
      );
    });

    it("should return multiple instances", async () => {
      const instances = await s3Converter.convertMultiple(values);
      expect(instances).toHaveProperty("myConf", { applicationName: "hello" });
      expect(instances).toHaveProperty("otherConf", { username: "admin" });
    });
  });

  describe("when file extension is not .json", () => {
    let s3Converter;
    let values;

    beforeEach(() => {
      values = {
        myConf: "mybucket/nested/name.txt"
      };
      s3Converter = new S3Converter(awsS3);
    });

    it("should throw error", async () => {
      await expect(s3Converter.convertMultiple(values)).rejects.toThrow(
        /Object path must have .json extension/
      );
    });
  });
});
