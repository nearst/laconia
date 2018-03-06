const { lambdaInvoker } = require('@laconia/aws-invoke')
const basicHandler = require('./basic-handler')

module.exports = (handler) => basicHandler((event, context) => {
  const recurse = (response) => lambdaInvoker(context.functionName).fireAndForget(response)
  return handler(event, context, recurse)
})
