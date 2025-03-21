const CoreLaconiaContext = require("./CoreLaconiaContext");

const checkFunction = (functionName, argument) => {
  if (typeof argument !== "function")
    throw new TypeError(
      `${functionName}() expects to be passed a function, you passed: ${JSON.stringify(
        argument
      )}`
    );
};

module.exports = app => {
  checkFunction("laconia", app);
  const laconiaContext = new CoreLaconiaContext();

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
    if (Array.isArray(factory)) {
      factory.forEach(f => checkFunction("register", f));
      laconiaContext.registerFactories(factory, options.cache);
    } else {
      checkFunction("register", factory);
      laconiaContext.registerFactory(factory, options.cache);
    }
  };

  return Object.assign(laconia, {
    register: (factory, optionsOrFactory, options = {}) => {
      if (typeof optionsOrFactory !== "function") {
        options = optionsOrFactory || {};
      }

      if (typeof factory === "string") {
        registerSingle(factory, optionsOrFactory, options);
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
