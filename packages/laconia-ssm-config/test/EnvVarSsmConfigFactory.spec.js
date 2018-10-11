const AWSSDK = require("aws-sdk");
const AWS = require("aws-sdk-mock");
const { yields } = require("@laconia/test-helper");
const EnvVarSsmConfigFactory = require("../src/EnvVarSsmConfigFactory");

describe("EnvVarSsmConfigFactory", () => {
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
      const secretFactory = new EnvVarSsmConfigFactory(
        {
          API_KEY: "super secret"
        },
        awsSsm
      );
      const instances = await secretFactory.makeInstances();
      expect(instances).toEqual({});
    });

    it("should not call SSM", async () => {
      const secretFactory = new EnvVarSsmConfigFactory(
        {
          API_KEY: "super secret"
        },
        awsSsm
      );
      await secretFactory.makeInstances();
      expect(ssm.getParameters).not.toBeCalled();
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

    it("creates simple instance name based on the env var name", async () => {
      const secretFactory = new EnvVarSsmConfigFactory(
        {
          LACONIA_SSMCONFIG_API_KEY: "super secret"
        },
        awsSsm
      );
      const instances = await secretFactory.makeInstances();
      expect(instances).toHaveProperty("apiKey");
    });

    it("should retrieve one parameter from SSM based on the env var value", async () => {
      const secretFactory = new EnvVarSsmConfigFactory(
        {
          LACONIA_SSMCONFIG_API_KEY: "/path/to/api/key"
        },
        awsSsm
      );
      await secretFactory.makeInstances();
      expect(ssm.getParameters).toBeCalledWith(
        expect.objectContaining({ Names: ["/path/to/api/key"] }),
        expect.any(Function)
      );
    });

    it("should return one secret returned by SSM", async () => {
      const secretFactory = new EnvVarSsmConfigFactory(
        {
          LACONIA_SSMCONFIG_API_KEY: "/path/to/api/key"
        },
        awsSsm
      );
      const result = await secretFactory.makeInstances();

      expect(result).toHaveProperty("apiKey", "api key secret");
    });

    it("should hit SSM with Decryption option", async () => {
      const secretFactory = new EnvVarSsmConfigFactory(
        {
          LACONIA_SSMCONFIG_API_KEY: "/path/to/api/key"
        },
        awsSsm
      );
      await secretFactory.makeInstances();

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
      const secretFactory = new EnvVarSsmConfigFactory(
        {
          LACONIA_SSMCONFIG_API_KEY: "/path/to/api/key"
        },
        awsSsm
      );
      await expect(secretFactory.makeInstances()).rejects.toThrow(
        /Invalid parameters: secret pathway, boom/
      );
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
      const secretFactory = new EnvVarSsmConfigFactory(
        {
          LACONIA_SSMCONFIG_API_KEY: "/path/to/api/key",
          LACONIA_SSMCONFIG_RECIPE: "/otherpath"
        },
        awsSsm
      );
      const result = await secretFactory.makeInstances();

      expect(result).toHaveProperty("apiKey", "api key secret");
      expect(result).toHaveProperty("recipe", "secret sauce");
    });
  });
});
