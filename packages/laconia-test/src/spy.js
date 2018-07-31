module.exports = fn => {
  return async lc => {
    const spier = lc["$spierFactory"].makeSpy();
    const response = await Promise.all([fn(lc), spier.track(lc)]);
    return response[0];
  };
};
