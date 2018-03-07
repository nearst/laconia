const { lambdaInvoker } = require('@laconia/aws-invoke')
const basicHandler = require('./basic-handler')

module.exports = (handler) => basicHandler((event, context) => {
  const recurse = (response) => {
    return lambdaInvoker(context.functionName).fireAndForget(Object.assign({}, event, response))
  }
  return handler(event, context, recurse)
})
