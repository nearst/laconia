const AWS = require("aws-sdk-mock");
const { yields } = require("laconia-test-helper");
const EnvVarSsmSecretFactory = require("../src/EnvVarSsmSecretFactory");

describe("EnvVarSsmSecretFactory", () => {
  let ssm;

  beforeEach(() => {
    ssm = {
      getParameters: jest
        .fn()
        .mockImplementation(
          yields({ Parameters: [{ "parameter name": { Value: "secret" } }] })
        )
    };
    AWS.mock("SSM", "getParameter", ssm.getParameter);
  });

  afterEach(() => {
    AWS.restore();
  });

  it("creates simple instance name based on the env var name", () => {
    const secretFactory = new EnvVarSsmSecretFactory({
      LACONIA_SSM_API_KEY: "api value"
    });
    const instances = secretFactory.makeInstances();
    expect(instances).toHaveProperty("apiKey");
  });

  xit("should throw error when InvalidParameters is returned", () => {});
});
