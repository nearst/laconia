const CoreLaconiaContext = require("./CoreLaconiaContext");

module.exports = fn => {
  const instanceFns = [];
  const laconia = async (event, context, callback) => {
    const laconiaContext = new CoreLaconiaContext({ event, context });
    for (const instanceFn of instanceFns) {
      laconiaContext.register(await instanceFn(laconiaContext));
    }

    try {
      const result = await fn(laconiaContext);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  };

  return Object.assign(laconia, {
    run: laconiaContext => fn(laconiaContext),
    register: instanceFn => {
      instanceFns.push(instanceFn);
      return laconia;
    }
  });
};
