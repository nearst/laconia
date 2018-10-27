const LaconiaContextSpierFactory = require("./LaconiaContextSpierFactory");

const spy = fn => {
  return async (event, lc) => {
    if (lc["$run"]) {
      return fn(event, lc);
    }
    const spier = lc["$spierFactory"].makeSpier();
    const response = await Promise.all([fn(event, lc), spier.track(lc)]);
    return response[0];
  };
};

spy.instances = () => lc => ({
  $spierFactory: new LaconiaContextSpierFactory(lc)
});

module.exports = spy;
