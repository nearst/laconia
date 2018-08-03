const LaconiaContextSpierFactory = require("./LaconiaContextSpierFactory");

const spy = fn => {
  return async lc => {
    if (lc["$run"]) {
      return fn(lc);
    }
    const spier = lc["$spierFactory"].makeSpier();
    const response = await Promise.all([fn(lc), spier.track(lc)]);
    return response[0];
  };
};

spy.instances = lc => ({
  $spierFactory: new LaconiaContextSpierFactory(lc)
});

module.exports = spy;
