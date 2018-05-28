const CoreLaconiaContext = require("./CoreLaconiaContext");

module.exports = fn => {
  const useFns = [];
  const laconia = async (event, context, callback) => {
    const laconiaContext = new CoreLaconiaContext({ event, context });
    for (const useFn of useFns) {
      laconiaContext.register(await useFn(laconiaContext));
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
    use: useFn => {
      useFns.push(useFn);
      return laconia;
    }
  });
};
