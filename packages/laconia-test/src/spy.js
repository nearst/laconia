module.exports = fn => {
  return async lc => {
    const spyer = lc["$spyerFactory"].makeSpy();
    const response = await Promise.all([fn(lc), spyer.track(lc)]);
    return response[0];
  };
};
