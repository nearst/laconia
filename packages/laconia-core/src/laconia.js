const CoreLaconiaContext = require("./CoreLaconiaContext");

module.exports = fn => {
  const laconiaContext = new CoreLaconiaContext({});

  const laconia = async (event, context, callback) => {
    laconiaContext.registerInstances({ event, context });
    await laconiaContext.refresh();

    try {
      const result = await fn(laconiaContext);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  };

  return Object.assign(laconia, {
    run: laconiaContext => {
      return fn({ $run: true, ...laconiaContext });
    },
    register: (factory, options = {}) => {
      if (Array.isArray(factory)) {
        laconiaContext.registerFactories(factory, options.cache);
      } else {
        laconiaContext.registerFactory(factory, options.cache);
      }
      return laconia;
    },
    postProcessor: postProcessor => {
      laconiaContext.registerPostProcessor(postProcessor);
      return laconia;
    }
  });
};
