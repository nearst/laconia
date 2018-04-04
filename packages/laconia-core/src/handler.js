module.exports = handler => (event, context, callback) => {
  const laconiaContext = { event, context };
  return Promise.resolve()
    .then(_ => handler(laconiaContext))
    .then(result => callback(null, result))
    .catch(err => callback(err));
};
