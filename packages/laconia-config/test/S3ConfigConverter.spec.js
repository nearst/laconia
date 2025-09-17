const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { mockClient } = require("aws-sdk-client-mock");
const { s3Body } = require("@laconia/test-helper");
const S3ConfigConverter = require("../src/S3ConfigConverter");

describe("S3ConfigConverter", () => {
  const s3Mock = mockClient(S3Client);

  beforeEach(() => {
    s3Mock.resolves({
      Body: s3Body({ applicationName: "hello" })
    });
  });

  describe("when there is no env var set", () => {
    let configConverter;

    beforeEach(() => {
      configConverter = new S3ConfigConverter();
    });

    it("return empty instances", async () => {
      const instances = await configConverter.convertMultiple({});
      expect(instances).toEqual({});
    });

    it("should not call S3", async () => {
      await configConverter.convertMultiple({});
      expect(s3Mock).not.toHaveReceivedAnyCommand();
    });
  });

  describe("when there is one value", () => {
    let configConverter;
    let values;

    beforeEach(() => {
      configConverter = new S3ConfigConverter();
      values = {
        myConf: "mybucket/nested/name.json"
      };
    });

    it("should call S3 with the specified value", async () => {
      await configConverter.convertMultiple(values);
      expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
        Bucket: "mybucket",
        Key: "nested/name.json"
      });
    });

    it("should return app config instance", async () => {
      const instances = await configConverter.convertMultiple(values);
      expect(instances).toHaveProperty("myConf", { applicationName: "hello" });
    });
  });

  describe("when there is multiple values specified", () => {
    let configConverter;
    let values;

    beforeEach(() => {
      values = {
        myConf: "mybucket/nested/name.json",
        otherConf: "otherbucket/nested/bar/other.json"
      };

      s3Mock.on(GetObjectCommand).callsFake(input => ({
        Body: s3Body(
          input.Bucket === "mybucket"
            ? { applicationName: "hello" }
            : { username: "admin" }
        )
      }));

      configConverter = new S3ConfigConverter();
    });

    it("should call S3 with the configured env var value", async () => {
      await configConverter.convertMultiple(values);
      expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
        Bucket: "mybucket",
        Key: "nested/name.json"
      });
      expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
        Bucket: "otherbucket",
        Key: "nested/bar/other.json"
      });
    });

    it("should return multiple instances", async () => {
      const instances = await configConverter.convertMultiple(values);
      expect(instances).toHaveProperty("myConf", { applicationName: "hello" });
      expect(instances).toHaveProperty("otherConf", { username: "admin" });
    });
  });

  describe("when file extension is not .json", () => {
    let configConverter;
    let values;

    beforeEach(() => {
      values = {
        myConf: "mybucket/nested/name.txt"
      };
      configConverter = new S3ConfigConverter();
    });

    it("should throw error", async () => {
      await expect(configConverter.convertMultiple(values)).rejects.toThrow(
        /Object path must have .json extension/
      );
    });
  });
});
