const AWS = require("aws-sdk");
const AWSMock = require("aws-sdk-mock");
const { yields } = require("@laconia/test-helper");
const SecretsManagerConfigConverter = require("../src/SecretsManagerConfigConverter");

AWSMock.setSDKInstance(AWS);

describe("SecretsManagerConfigConverter", () => {
  let secretsManager;
  let awsSecretsManager;

  afterEach(() => {
    AWSMock.restore();
  });

  beforeEach(() => {
    secretsManager = {
      getSecretValue: jest.fn()
    };
    AWSMock.mock(
      "SecretsManager",
      "getSecretValue",
      secretsManager.getSecretValue
    );
    awsSecretsManager = new AWS.SecretsManager();
  });

  describe("when there is no parameter to be retrieved", () => {
    beforeEach(() => {
      secretsManager.getSecretValue.mockImplementation(
        yields({
          Parameters: [],
          InvalidParameters: []
        })
      );
    });

    it("return empty instances", async () => {
      const configConverter = new SecretsManagerConfigConverter(
        awsSecretsManager
      );
      const instances = await configConverter.convertMultiple({});
      expect(instances).toEqual({});
    });
  });

  describe("when single parameter is retrieved", () => {
    let secretsStore;
    let configConverter;

    beforeEach(() => {
      configConverter = new SecretsManagerConfigConverter(awsSecretsManager);
      secretsStore = {
        myProdApiKey: "secret-api-key",
        myProductionDbPassword: "secret-db-password",
        myProdBase64EncodedKey: Buffer.from("base64-encoded"),
        myKeyValueSecrets: `{ "apiKey": "test-api-key", "apiSecret": "some-secret" }`
      };
      secretsManager.getSecretValue.mockImplementation((params, callback) => {
        const secret = secretsStore[params.SecretId];

        const res = {};
        if (Buffer.isBuffer(secret)) {
          res.SecretBinary = secret.toString("base64");
        } else {
          res.SecretString = secret;
        }

        callback(null, res);
      });
    });

    it("should retrieve one secret", async () => {
      const result = await configConverter.convertMultiple({
        apiKey: "myProdApiKey"
      });

      expect(result).toHaveProperty("apiKey", "secret-api-key");
      expect(secretsManager.getSecretValue).toBeCalledWith(
        expect.objectContaining({ SecretId: "myProdApiKey" }),
        expect.any(Function)
      );

      expect(secretsManager.getSecretValue).toHaveBeenCalledTimes(1);
    });

    it("should retrieve more than one secret", async () => {
      const result = await configConverter.convertMultiple({
        apiKey: "myProdApiKey",
        dbPass: "myProductionDbPassword",
        base64Encoded: "myProdBase64EncodedKey",
        keyValPair: "myKeyValueSecrets"
      });

      expect(result).toEqual({
        apiKey: "secret-api-key",
        dbPass: "secret-db-password",
        base64Encoded: secretsStore.myProdBase64EncodedKey.toString("ascii"),
        keyValPair: {
          apiKey: "test-api-key",
          apiSecret: "some-secret"
        }
      });

      expect(secretsManager.getSecretValue).toBeCalledWith(
        expect.objectContaining({ SecretId: "myProdApiKey" }),
        expect.any(Function)
      );

      expect(secretsManager.getSecretValue).toBeCalledWith(
        expect.objectContaining({ SecretId: "myProductionDbPassword" }),
        expect.any(Function)
      );

      expect(secretsManager.getSecretValue).toBeCalledWith(
        expect.objectContaining({ SecretId: "myProdBase64EncodedKey" }),
        expect.any(Function)
      );

      expect(secretsManager.getSecretValue).toBeCalledWith(
        expect.objectContaining({ SecretId: "myKeyValueSecrets" }),
        expect.any(Function)
      );

      expect(secretsManager.getSecretValue).toHaveBeenCalledTimes(4);
    });
  });
});
