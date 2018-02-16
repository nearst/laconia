const { lambdaInvoker } = require('@laconia/aws-invoke')
const AWS = require('aws-sdk')
const BatchProcessor = require('./BatchProcessor')
const S3ItemReader = require('./S3ItemReader')
const EventEmitter = require('events')

const recursiveHandler = (handler) => (event, context, callback) => {
  const recurse = (response) => { lambdaInvoker(context.functionName).fireAndForget(response) }
  return handler(event, context, recurse)
}

const forwardEvents = (from, eventNames, to) => {
  eventNames.forEach(eventName => from.on(eventName, (...args) => to.emit(eventName, ...args)))
}

module.exports = (path, params,
  {
    s3 = new AWS.S3(),
    timeNeededToRecurseInMillis = 5000
  } = {}) => {
  const handler = recursiveHandler((event, context, recurse) => {
    const itemReader = new S3ItemReader(s3, params, path)
    const batchProcessor = new BatchProcessor(
        itemReader.next.bind(itemReader),
        (cursor) => context.getRemainingTimeInMillis() <= timeNeededToRecurseInMillis
      )
      .on('stop', (cursor) => { recurse({ cursor }) })
    forwardEvents(batchProcessor, ['stop', 'item', 'end'], handler)

    handler.emit('start', event, context)
    return batchProcessor.start(event.cursor)
  })
  return Object.assign(handler, EventEmitter.prototype)
}
