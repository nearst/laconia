module.exports = fn => {
  return async lc => {
    if (lc["$run"]) {
      return fn(lc);
    }
    const spier = lc["$spierFactory"].makeSpier();
    const response = await Promise.all([fn(lc), spier.track(lc)]);
    return response[0];
  };
};
