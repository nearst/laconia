const { SSMClient, GetParametersCommand } = require("@aws-sdk/client-ssm");
const { mockClient } = require("aws-sdk-client-mock");
const SsmConfigConverter = require("../src/SsmConfigConverter");

describe("SsmConfigConverter", () => {
  const mock = mockClient(SSMClient);

  afterEach(() => {
    mock.reset();
  });

  beforeEach(() => {
    mock.on(GetParametersCommand).callsFake(input => {
      const params = input.Names.map(name => {
        return { Name: name, Value: `value-for-${name}` };
      });
      return {
        Parameters: params,
        InvalidParameters: []
      };
    });
  });

  describe("when there is no parameter to be retrieved", () => {
    beforeEach(() => {
      mock.on(GetParametersCommand).resolves({
        Parameters: [],
        InvalidParameters: []
      });
    });

    it("return empty instances", async () => {
      const configConverter = new SsmConfigConverter();
      const instances = await configConverter.convertMultiple({});
      expect(instances).toEqual({});
    });
  });

  describe("when single parameter is retrieved", () => {
    beforeEach(() => {
      mock.on(GetParametersCommand).resolves({
        Parameters: [{ Name: "/path/to/api/key", Value: "api key secret" }],
        InvalidParameters: []
      });
    });

    it("should retrieve one parameter from SSM", async () => {
      const configConverter = new SsmConfigConverter();
      await configConverter.convertMultiple({
        apiKey: "/path/to/api/key"
      });
      expect(mock).toHaveReceivedCommandWith(GetParametersCommand, {
        Names: ["/path/to/api/key"]
      });
    });

    it("should return one secret returned by SSM", async () => {
      const configConverter = new SsmConfigConverter();
      const result = await configConverter.convertMultiple({
        apiKey: "/path/to/api/key"
      });

      expect(result).toHaveProperty("apiKey", "api key secret");
    });

    it("should hit SSM with Decryption option", async () => {
      const configConverter = new SsmConfigConverter();
      await configConverter.convertMultiple({
        apiKey: "/path/to/api/key"
      });

      expect(mock).toHaveReceivedCommandWith(GetParametersCommand, {
        Names: ["/path/to/api/key"],
        WithDecryption: true
      });
    });
  });

  describe("when InvalidParameters are returned", () => {
    it("should throw error", async () => {
      mock.on(GetParametersCommand).resolves({
        Parameters: [{ Name: "/path/to/api/key", Value: "api key secret" }],
        InvalidParameters: ["secret pathway", "boom"]
      });
      const configConverter = new SsmConfigConverter();
      await expect(
        configConverter.convertMultiple({
          apiKey: "/path/to/api/key"
        })
      ).rejects.toThrow(/Invalid parameters: secret pathway, boom/);
    });
  });

  describe("when multiple parameters are retrieved", () => {
    beforeEach(() => {
      mock.on(GetParametersCommand).resolves({
        Parameters: [
          { Name: "/path/to/api/key", Value: "api key secret" },
          { Name: "/otherpath", Value: "secret sauce" }
        ],
        InvalidParameters: []
      });
    });

    it("should return multiple secrets returned by SSM", async () => {
      const configConverter = new SsmConfigConverter();
      const result = await configConverter.convertMultiple({
        apiKey: "/path/to/api/key",
        recipe: "/otherpath"
      });

      expect(result).toHaveProperty("apiKey", "api key secret");
      expect(result).toHaveProperty("recipe", "secret sauce");
    });
  });
});
