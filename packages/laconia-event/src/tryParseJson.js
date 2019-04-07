module.exports = object => {
  try {
    return JSON.parse(object);
  } catch (ignored) {
    return object;
  }
};
