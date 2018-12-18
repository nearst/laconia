const LaconiaContextSpierFactory = require("./LaconiaContextSpierFactory");

const spy = fn => {
  return async (input, lc) => {
    const spier = lc["$spierFactory"].makeSpier();
    const response = await Promise.all([fn(input, lc), spier.track(lc)]);
    return response[0];
  };
};

spy.instances = () => lc => ({
  $spierFactory: new LaconiaContextSpierFactory(lc)
});

module.exports = spy;
