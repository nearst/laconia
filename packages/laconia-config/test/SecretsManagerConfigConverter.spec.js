const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");
const { mockClient } = require("aws-sdk-client-mock");
const SecretsManagerConfigConverter = require("../src/SecretsManagerConfigConverter");

describe("SecretsManagerConfigConverter", () => {
  const mock = mockClient(SecretsManagerClient);

  afterEach(() => {
    mock.reset();
  });

  describe("when there is no parameter to be retrieved", () => {
    it("return empty instances", async () => {
      const configConverter = new SecretsManagerConfigConverter();
      const instances = await configConverter.convertMultiple({});
      expect(instances).toEqual({});
    });
  });

  describe("when single parameter is retrieved", () => {
    let secretsStore;
    let configConverter;

    beforeEach(() => {
      configConverter = new SecretsManagerConfigConverter();
      secretsStore = {
        myProdApiKey: "secret-api-key",
        myProductionDbPassword: "secret-db-password",
        myProdBase64EncodedKey: Buffer.from("base64-encoded"),
        myKeyValueSecrets: `{ "apiKey": "test-api-key", "apiSecret": "some-secret" }`
      };
      mock.on(GetSecretValueCommand).callsFake(input => {
        const secret = secretsStore[input.SecretId];

        const res = {};
        if (Buffer.isBuffer(secret)) {
          res.SecretBinary = secret.toString("base64");
        } else {
          res.SecretString = secret;
        }

        return res;
      });
    });

    it("should retrieve one secret", async () => {
      const result = await configConverter.convertMultiple({
        apiKey: "myProdApiKey"
      });

      expect(result).toHaveProperty("apiKey", "secret-api-key");
      expect(mock).toHaveReceivedCommandWith(GetSecretValueCommand, {
        SecretId: "myProdApiKey"
      });
      expect(mock).toHaveReceivedCommandTimes(GetSecretValueCommand, 1);
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

      expect(mock).toHaveReceivedCommandWith(GetSecretValueCommand, {
        SecretId: "myProdApiKey"
      });

      expect(mock).toHaveReceivedCommandWith(GetSecretValueCommand, {
        SecretId: "myProductionDbPassword"
      });

      expect(mock).toHaveReceivedCommandWith(GetSecretValueCommand, {
        SecretId: "myProdBase64EncodedKey"
      });

      expect(mock).toHaveReceivedCommandWith(GetSecretValueCommand, {
        SecretId: "myKeyValueSecrets"
      });

      expect(mock).toHaveReceivedCommandTimes(GetSecretValueCommand, 4);
    });
  });
});
