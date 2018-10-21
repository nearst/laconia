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

  describe("when there is one env var and one value type factory", () => {
    it("should call the configured boolean factory with transformed values", async () => {
      const booleanFactory = { makeInstances: jest.fn() };
      const env = { LACONIA_CONFIG_ENABLE_LOGGING: "boolean:no" };
      const factoryMap = { boolean: booleanFactory };
      configFactory = new EnvVarConfigFactory(env, factoryMap);
      await configFactory.makeInstances();
      expect(booleanFactory.makeInstances).toHaveBeenCalledWith({
        enableLogging: "no"
      });
    });

    describe("when ssm factory is configured", () => {
      let ssmFactory;
      beforeEach(() => {
        ssmFactory = {
          makeInstances: jest.fn().mockResolvedValue({ secret: "mysecret" })
        };
        const env = { LACONIA_CONFIG_SECRET: "ssm:/path/to/secret" };
        const factoryMap = { ssm: ssmFactory };
        configFactory = new EnvVarConfigFactory(env, factoryMap);
      });

      it("should call the configured ssm factory with transformed values", async () => {
        await configFactory.makeInstances();
        expect(ssmFactory.makeInstances).toHaveBeenCalledWith({
          secret: "/path/to/secret"
        });
      });

      it("should return the value returned by Value type factory", async () => {
        const instances = await configFactory.makeInstances();
        expect(instances).toEqual({ secret: "mysecret" });
      });
    });
  });
});
