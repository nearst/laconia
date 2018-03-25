const invoke = require('laconia-invoke')
const basicHandler = require('./basic-handler')
const isplainobject = require('lodash.isplainobject')
const _ = { isPlainObject: isplainobject }

module.exports = (handler) => basicHandler(laconiaContext => {
  const {event, context} = laconiaContext
  const recurse = (payload = {}) => {
    if (!_.isPlainObject(payload)) {
      throw new Error('Payload must be an object')
    }
    return invoke(context.functionName).fireAndForget(Object.assign({}, event, payload))
  }
  return handler(laconiaContext, recurse)
})
