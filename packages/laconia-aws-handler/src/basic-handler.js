module.exports = (handler) => (event, context, callback) => {
  return Promise.resolve()
    .then(_ => handler(event, context))
    .then(result => callback(null, result))
    .catch(err => callback(err))
}
