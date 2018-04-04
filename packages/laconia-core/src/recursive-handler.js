const invoke = require('./invoke')
const laconia = require('./laconia')
const isplainobject = require('lodash.isplainobject')
const _ = { isPlainObject: isplainobject }

module.exports = (fn) => laconia(laconiaContext => {
  const {event, context} = laconiaContext
  const recurse = (payload = {}) => {
    if (!_.isPlainObject(payload)) {
      throw new Error('Payload must be an object')
    }
    return invoke(context.functionName).fireAndForget(Object.assign({}, event, payload))
  }
  return fn(laconiaContext, recurse)
})
