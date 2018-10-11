const AWSSDK = require("aws-sdk");
const AWS = require("aws-sdk-mock");
const { yields, s3Body } = require("@laconia/test-helper");
const EnvVarS3ConfigFactory = require("../src/EnvVarS3ConfigFactory");

describe("EnvVarS3ConfigFactory", () => {
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
    let s3ConfigFactory;

    beforeEach(() => {
      s3ConfigFactory = new EnvVarS3ConfigFactory(
        {
          NOTHING: "empty"
        },
        awsS3
      );
    });

    it("return empty instances", async () => {
      const instances = await s3ConfigFactory.makeInstances();
      expect(instances).toEqual({});
    });

    it("should not call S3", async () => {
      await s3ConfigFactory.makeInstances();
      expect(s3.getObject).not.toBeCalled();
    });
  });

  describe("when there is one env var set", () => {
    let s3ConfigFactory;

    beforeEach(() => {
      s3ConfigFactory = new EnvVarS3ConfigFactory(
        {
          LACONIA_S3CONFIG_MY_CONF: "mybucket/nested/name.json"
        },
        awsS3
      );
    });

    it("should call S3 with the configured env var value", async () => {
      await s3ConfigFactory.makeInstances();
      expect(s3.getObject).toBeCalledWith(
        {
          Bucket: "mybucket",
          Key: "nested/name.json"
        },
        expect.any(Function)
      );
    });

    it("should return app config instance", async () => {
      const instances = await s3ConfigFactory.makeInstances();
      expect(instances).toHaveProperty("myConf", { applicationName: "hello" });
    });
  });

  describe("when there is multiple env vars set", () => {
    let s3ConfigFactory;

    beforeEach(() => {
      s3ConfigFactory = new EnvVarS3ConfigFactory(
        {
          LACONIA_S3CONFIG_MY_CONF: "mybucket/nested/name.json",
          LACONIA_S3CONFIG_OTHER_CONF: "otherbucket/nested/bar/other.json"
        },
        awsS3
      );

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
      await s3ConfigFactory.makeInstances();
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
      const instances = await s3ConfigFactory.makeInstances();
      expect(instances).toHaveProperty("myConf", { applicationName: "hello" });
      expect(instances).toHaveProperty("otherConf", { username: "admin" });
    });
  });

  describe("when file extension is not .json", () => {
    let s3ConfigFactory;

    beforeEach(() => {
      s3ConfigFactory = new EnvVarS3ConfigFactory(
        {
          LACONIA_S3CONFIG_MY_CONF: "mybucket/nested/name.txt"
        },
        awsS3
      );
    });

    it("should throw error", async () => {
      expect(s3ConfigFactory.makeInstances()).rejects.toThrow(
        /Object path must have .json extension/
      );
    });
  });
});
