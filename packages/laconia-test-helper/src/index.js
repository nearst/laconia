const yields = (arg) => (params, callback) => callback(null, arg)

const s3Body = (object) => yields({
  Body: {
    toString: () => (JSON.stringify(object))
  }
})

module.exports.yields = yields
module.exports.s3Body = s3Body
