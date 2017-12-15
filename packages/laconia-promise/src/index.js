module.exports = handler => (event, context, callback) => {
  return Promise.resolve()
    .then(_ => handler(event, context, callback))
    .then(result => callback(null, result));
};
