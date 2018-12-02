const CoreLaconiaContext = require("./CoreLaconiaContext");

const checkFunction = fn => {
  if (!fn)
    throw new TypeError(
      `laconia() expects to be passed a function, you passed: ${fn}`
    );
  if (typeof fn !== "function")
    throw new TypeError(
      `laconia() expects to be passed a function, you passed a non function: ${fn}`
    );
};

module.exports = fn => {
  checkFunction(fn);
  const laconiaContext = new CoreLaconiaContext();

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
