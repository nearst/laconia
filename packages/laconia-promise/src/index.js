module.exports = () => (event, context, callback) => {
  return Promise.resolve()
    .then(_ => callback(null))
}
