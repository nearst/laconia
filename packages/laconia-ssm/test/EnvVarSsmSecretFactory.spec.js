const AWS = require("aws-sdk-mock");
const { yields } = require("laconia-test-helper");
const EnvVarSsmSecretFactory = require("../src/EnvVarSsmSecretFactory");

describe("EnvVarSsmSecretFactory", () => {
  let ssm;

  beforeEach(() => {
    ssm = {
      getParameters: jest.fn().mockImplementation(
        yields({
          Parameters: [{ Name: "/path/to/api/key", Value: "api key secret" }]
        })
      )
    };
    AWS.mock("SSM", "getParameters", ssm.getParameters);
  });

  afterEach(() => {
    AWS.restore();
  });

  it("creates simple instance name based on the env var name", async () => {
    const secretFactory = new EnvVarSsmSecretFactory({
      LACONIA_SSM_API_KEY: "super secret"
    });
    const instances = await secretFactory.makeInstances();
    expect(instances).toHaveProperty("apiKey");
  });

  it("should retrieve one parameter from SSM based on the env var value", async () => {
    const secretFactory = new EnvVarSsmSecretFactory({
      LACONIA_SSM_API_KEY: "/path/to/api/key"
    });
    await secretFactory.makeInstances();
    expect(ssm.getParameters).toBeCalledWith(
      expect.objectContaining({ Names: ["/path/to/api/key"] }),
      expect.any(Function)
    );
  });

  it("should return one secret returned by SSM", async () => {
    const secretFactory = new EnvVarSsmSecretFactory({
      LACONIA_SSM_API_KEY: "/path/to/api/key"
    });
    const result = await secretFactory.makeInstances();

    expect(result).toHaveProperty("apiKey", "api key secret");
  });

  it("should hit SSM with Decryption option", async () => {
    const secretFactory = new EnvVarSsmSecretFactory({
      LACONIA_SSM_API_KEY: "/path/to/api/key"
    });
    await secretFactory.makeInstances();

    expect(ssm.getParameters).toBeCalledWith(
      expect.objectContaining({ WithDecryption: true }),
      expect.any(Function)
    );
  });

  xit("should throw error when InvalidParameters is returned", () => {});
});
