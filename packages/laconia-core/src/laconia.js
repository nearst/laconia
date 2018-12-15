const CoreLaconiaContext = require("./CoreLaconiaContext");

const checkFunction = (functionName, argument) => {
  if (typeof argument !== "function")
    throw new TypeError(
      `${functionName}() expects to be passed a function, you passed: ${JSON.stringify(
        argument
      )}`
    );
};

const proxyHandler = {
  get: (laconiaContext, instanceName) => {
    if (instanceName in laconiaContext) {
      return laconiaContext[instanceName];
    } else {
      if (
        instanceName !== "asymmetricMatch" &&
        !instanceName.startsWith("$") &&
        !instanceName.startsWith("_")
      ) {
        throw new Error(
          `The dependency ${instanceName} is not available. Have you registered your dependency? These are the dependencies available in LaconiaContext: ${Object.getOwnPropertyNames(
            laconiaContext
          )}`
        );
      }
    }
  }
};

module.exports = fn => {
  checkFunction("laconia", fn);
  const laconiaContext = new Proxy(new CoreLaconiaContext(), proxyHandler);

  const convertInput = event => laconiaContext.$inputConverter.convert(event);

  const laconia = async (event, context, callback) => {
    laconiaContext.registerInstances({ event, context });
    await laconiaContext.refresh();

    try {
      const input = await convertInput(event);

      const result = await fn(input, laconiaContext);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  };

  return Object.assign(laconia, {
    run: (event, laconiaContext) => {
      return fn(event, { $run: true, ...laconiaContext });
    },
    register: (factory, options = {}) => {
      if (Array.isArray(factory)) {
        factory.forEach(f => checkFunction("register", f));
        laconiaContext.registerFactories(factory, options.cache);
      } else {
        checkFunction("register", factory);
        laconiaContext.registerFactory(factory, options.cache);
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
