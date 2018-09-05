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
    register: (factoryFn, options = {}) => {
      laconiaContext.registerFactory(factoryFn, options.cache);
      return laconia;
    }
  });
};
