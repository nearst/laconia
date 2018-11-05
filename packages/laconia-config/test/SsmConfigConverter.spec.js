const AWSSDK = require("aws-sdk");
const AWS = require("aws-sdk-mock");
const { yields } = require("@laconia/test-helper");
const SsmConfigConverter = require("../src/SsmConfigConverter");

describe("SsmConfigConverter", () => {
  let ssm;
  let awsSsm;

  afterEach(() => {
    AWS.restore();
  });

  beforeEach(() => {
    ssm = {
      getParameters: jest.fn()
    };
    AWS.mock("SSM", "getParameters", ssm.getParameters);
    awsSsm = new AWSSDK.SSM();
  });

  describe("when there is no parameter to be retrieved", () => {
    beforeEach(() => {
      ssm.getParameters.mockImplementation(
        yields({
          Parameters: [],
          InvalidParameters: []
        })
      );
    });

    it("return empty instances", async () => {
      const configConverter = new SsmConfigConverter(awsSsm);
      const instances = await configConverter.convertMultiple({});
      expect(instances).toEqual({});
    });
  });

  describe("when single parameter is retrieved", () => {
    beforeEach(() => {
      ssm.getParameters.mockImplementation(
        yields({
          Parameters: [{ Name: "/path/to/api/key", Value: "api key secret" }],
          InvalidParameters: []
        })
      );
    });

    it("should retrieve one parameter from SSM", async () => {
      const configConverter = new SsmConfigConverter(awsSsm);
      await configConverter.convertMultiple({
        apiKey: "/path/to/api/key"
      });
      expect(ssm.getParameters).toBeCalledWith(
        expect.objectContaining({ Names: ["/path/to/api/key"] }),
        expect.any(Function)
      );
    });

    it("should return one secret returned by SSM", async () => {
      const configConverter = new SsmConfigConverter(awsSsm);
      const result = await configConverter.convertMultiple({
        apiKey: "/path/to/api/key"
      });

      expect(result).toHaveProperty("apiKey", "api key secret");
    });

    it("should hit SSM with Decryption option", async () => {
      const configConverter = new SsmConfigConverter(awsSsm);
      await configConverter.convertMultiple({
        apiKey: "/path/to/api/key"
      });

      expect(ssm.getParameters).toBeCalledWith(
        expect.objectContaining({ WithDecryption: true }),
        expect.any(Function)
      );
    });
  });

  describe("when InvalidParameters are returned", () => {
    it("should throw error", async () => {
      ssm.getParameters.mockImplementation(
        yields({
          Parameters: [{ Name: "/path/to/api/key", Value: "api key secret" }],
          InvalidParameters: ["secret pathway", "boom"]
        })
      );
      const configConverter = new SsmConfigConverter(awsSsm);
      await expect(
        configConverter.convertMultiple({
          apiKey: "/path/to/api/key"
        })
      ).rejects.toThrow(/Invalid parameters: secret pathway, boom/);
    });
  });

  describe("when multiple parameters are retrieved", () => {
    beforeEach(() => {
      ssm.getParameters.mockImplementation(
        yields({
          Parameters: [
            { Name: "/path/to/api/key", Value: "api key secret" },
            { Name: "/otherpath", Value: "secret sauce" }
          ],
          InvalidParameters: []
        })
      );
    });

    it("should return multiple secrets returned by SSM", async () => {
      const configConverter = new SsmConfigConverter(awsSsm);
      const result = await configConverter.convertMultiple({
        apiKey: "/path/to/api/key",
        recipe: "/otherpath"
      });

      expect(result).toHaveProperty("apiKey", "api key secret");
      expect(result).toHaveProperty("recipe", "secret sauce");
    });
  });
});
