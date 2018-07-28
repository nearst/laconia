module.exports = fn => {
  return lc => {
    lc["$spyFactory"].makeSpy(lc);
    return fn(lc);
  };
};
