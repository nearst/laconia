const EnvVarConfigFactory = require("../src/EnvVarConfigFactory");

describe("EnvVarConfigFactory", () => {
  let configFactory;

  describe("when there is no env var set", () => {
    beforeEach(() => {
      configFactory = new EnvVarConfigFactory(
        {
          NOTHING: "empty"
        },
        {}
      );
    });

    it("return empty instances", async () => {
      const instances = await configFactory.makeInstances();
      expect(instances).toEqual({});
    });
  });

  describe("when there is one env var and one converter", () => {
    it("should call the configured boolean converter with value type removed", async () => {
      const booleanConverter = { convertMultiple: jest.fn() };
      const env = { LACONIA_CONFIG_ENABLE_LOGGING: "boolean:no" };
      const converters = { boolean: booleanConverter };
      configFactory = new EnvVarConfigFactory(env, converters);
      await configFactory.makeInstances();
      expect(booleanConverter.convertMultiple).toHaveBeenCalledWith({
        enableLogging: "no"
      });
    });

    describe("when ssm converter is configured", () => {
      let ssmConverter;

      beforeEach(() => {
        ssmConverter = {
          convertMultiple: jest.fn().mockResolvedValue({ secret: "mysecret" })
        };
        const env = { LACONIA_CONFIG_SECRET: "ssm:/path/to/secret" };
        const converters = { ssm: ssmConverter };
        configFactory = new EnvVarConfigFactory(env, converters);
      });

      it("should call the configured ssm converter with the value type removed", async () => {
        await configFactory.makeInstances();
        expect(ssmConverter.convertMultiple).toHaveBeenCalledWith({
          secret: "/path/to/secret"
        });
      });

      it("should return the value returned by ssm converter", async () => {
        const instances = await configFactory.makeInstances();
        expect(instances).toEqual({ secret: "mysecret" });
      });
    });
  });

  describe("when there are multiple env vars and converters", () => {
    let ssmConverter;
    let booleanConverter;
    let secretsManagerConverter;
    let integerConverter;
    let floatConverter;

    beforeEach(() => {
      ssmConverter = {
        convertMultiple: jest
          .fn()
          .mockResolvedValue({ secret: "mysecret", password: "password" })
      };
      booleanConverter = {
        convertMultiple: jest
          .fn()
          .mockResolvedValue({ enableLogging: false, enableFeature: true })
      };
      secretsManagerConverter = {
        convertMultiple: jest.fn().mockResolvedValue({ apikey: "secretApiKey" })
      };
      integerConverter = {
        convertMultiple: jest.fn().mockResolvedValue({ port: 8080 })
      };
      floatConverter = {
        convertMultiple: jest.fn().mockResolvedValue({ taxRate: 1.093 })
      };

      const env = {
        LACONIA_CONFIG_SECRET: "ssm:/path/to/secret",
        LACONIA_CONFIG_PASSWORD: "ssm:/path/to/password",
        LACONIA_CONFIG_ENABLE_LOGGING: "boolean:no",
        LACONIA_CONFIG_ENABLE_FEATURE: "boolean:yes",
        LACONIA_CONFIG_PORT: "integer:8080",
        LACONIA_CONFIG_TAX_RATE: "float:1.093"
      };
      const converters = {
        ssm: ssmConverter,
        boolean: booleanConverter,
        secretsManager: secretsManagerConverter,
        integer: integerConverter,
        float: floatConverter
      };
      configFactory = new EnvVarConfigFactory(env, converters);
    });

    it("should call the configured converters with the value type removed", async () => {
      await configFactory.makeInstances();
      expect(ssmConverter.convertMultiple).toHaveBeenCalledWith({
        secret: "/path/to/secret",
        password: "/path/to/password"
      });
      expect(booleanConverter.convertMultiple).toHaveBeenCalledWith({
        enableLogging: "no",
        enableFeature: "yes"
      });
      expect(integerConverter.convertMultiple).toHaveBeenCalledWith({
        port: "8080"
      });
      expect(floatConverter.convertMultiple).toHaveBeenCalledWith({
        taxRate: "1.093"
      });
    });

    it("should not call the configured converters when `values` is empty", async () => {
      const converters = {
        ssm: ssmConverter,
        boolean: booleanConverter,
        secretsManager: secretsManagerConverter
      };
      const env = {
        LACONIA_CONFIG_API_SECRET: "secretsManager:path/to/api-key"
      };
      configFactory = new EnvVarConfigFactory(env, converters);
      await configFactory.makeInstances();
      expect(ssmConverter.convertMultiple).not.toHaveBeenCalled();
      expect(booleanConverter.convertMultiple).not.toHaveBeenCalled();
      expect(secretsManagerConverter.convertMultiple).toHaveBeenCalledWith({
        apiSecret: "path/to/api-key"
      });
    });

    it("should merge the values returned by converters", async () => {
      const instances = await configFactory.makeInstances();
      expect(instances).toEqual({
        secret: "mysecret",
        password: "password",
        enableLogging: false,
        enableFeature: true,
        port: 8080,
        taxRate: 1.093
      });
    });
  });

  describe("when there are no matching converter", () => {
    it("should not attempt to convert value", async () => {
      const ssmConverter = {
        convertMultiple: jest.fn().mockResolvedValue({})
      };
      const env = { LACONIA_CONFIG_FOO: "unknown:/path/to/secret" };
      const converters = { ssm: ssmConverter };
      configFactory = new EnvVarConfigFactory(env, converters);
      expect(ssmConverter.convertMultiple).not.toBeCalled();
    });
  });
});
