const CoreLaconiaContext = require("./CoreLaconiaContext");

const checkFunction = (functionName, argument) => {
  if (typeof argument !== "function")
    throw new TypeError(
      `${functionName}() expects to be passed a function, you passed: ${JSON.stringify(
        argument
      )}`
    );
};

module.exports = fn => {
  checkFunction("laconia", fn);
  const laconiaContext = new CoreLaconiaContext();

  const convertInput = event => laconiaContext.$inputConverter.convert(event);
  let _preHandle = () => {};
  let _postHandle = () => {};

  const applyPreHandle = async callback => {
    const response = await _preHandle(laconiaContext);
    if (response !== undefined) {
      callback(null, response);
      return false;
    }
    return true;
  };

  const laconia = async (event, context, callback) => {
    laconiaContext.registerInstances({ event, context });
    if ((await applyPreHandle(callback)) === false) return;
    await laconiaContext.refresh();

    try {
      const input = await convertInput(event);
      const result = await fn(input, laconiaContext);
      await _postHandle(laconiaContext, result);
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
    preHandle: preHandle => {
      checkFunction("preHandle", preHandle);
      _preHandle = preHandle;
      return laconia;
    },
    postHandle: postHandle => {
      checkFunction("postHandle", postHandle);
      _postHandle = postHandle;
      return laconia;
    },
    postProcessor: postProcessor => {
      checkFunction("postProcessor", postProcessor);
      laconiaContext.registerPostProcessor(postProcessor);
      return laconia;
    }
  });
};
