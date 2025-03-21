const AWS = require("aws-sdk");
const CoreLaconiaContext = require("./CoreLaconiaContext");
const { checkFunction, checkFunctionOrObject } = require("./typeChecking");

const awsInstances = {
  lambda: new AWS.Lambda(),
  s3: new AWS.S3(),
  ssm: new AWS.SSM(),
  sns: new AWS.SNS(),
  secretsManager: new AWS.SecretsManager()
};

module.exports = app => {
  checkFunction("laconia", app);
  const laconiaContext = new CoreLaconiaContext();
  laconiaContext.registerBuiltInInstances(awsInstances);

  const laconia = async (event, context, callback) => {
    laconiaContext.registerInstances({ event, context });
    await laconiaContext.refresh();
    if (!callback || process.env.LACONIA_NO_CALLBACK === "true") {
      return app(event, laconiaContext);
    }
    try {
      const result = await app(event, laconiaContext);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  };

  const registerSingle = (name, factory, options) => {
    checkFunction("register", factory);
    const registrableFactory = async laconiaContext => ({
      [name]: await factory(laconiaContext)
    });

    laconiaContext.registerFactory(registrableFactory, options.cache);
  };

  const registerMultiple = (factory, options = {}) => {
    const makeFactory = factory =>
      typeof factory === "function" ? factory : () => factory;

    if (Array.isArray(factory)) {
      factory.forEach(f => checkFunctionOrObject("register", f));
      const factories = factory.map(makeFactory);
      laconiaContext.registerFactories(factories, options.cache);
    } else {
      checkFunctionOrObject("register", factory);
      laconiaContext.registerFactory(makeFactory(factory), options.cache);
    }
  };

  return Object.assign(laconia, {
    register: (factory, optionsOrFactory, options = {}) => {
      if (typeof optionsOrFactory !== "function") {
        options = optionsOrFactory || {};
      }

      if (typeof factory === "string") {
        registerSingle(factory, optionsOrFactory, options);
      } else if (typeof factory === "object") {
        registerMultiple(factory, optionsOrFactory);
      } else {
        registerMultiple(factory, optionsOrFactory);
      }

      return laconia;
    },
    postProcessor: postProcessor => {
      checkFunction("postProcessor", postProcessor);
      laconiaContext.registerPostProcessor(postProcessor);
      return laconia;
    }
  });
};
