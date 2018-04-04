module.exports = (fn) => (event, context, callback) => {
  const laconiaContext = { event, context }
  return Promise.resolve()
    .then(_ => fn(laconiaContext))
    .then(result => callback(null, result))
    .catch(err => callback(err))
}
