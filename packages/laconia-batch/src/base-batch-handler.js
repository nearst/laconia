const { recursiveHandler } = require('laconia-handler')
const BatchProcessor = require('./BatchProcessor')
const EventEmitter = require('events')

const forwardEvents = (from, eventNames, to) => {
  eventNames.forEach(eventName => from.on(eventName, (...args) => to.emit(eventName, ...args)))
}

module.exports = (itemReader,
  {
    timeNeededToRecurseInMillis = 5000,
    itemsPerSecond
  }) => {
  const handler = recursiveHandler((event, context, recurse) => {
    const batchProcessor = new BatchProcessor(
        itemReader.next.bind(itemReader),
        (cursor) => context.getRemainingTimeInMillis() <= timeNeededToRecurseInMillis,
        { itemsPerSecond }
      )
      .on('stop', (cursor) => { recurse({ cursor }) })
    forwardEvents(batchProcessor, ['stop', 'item', 'end'], handler)

    handler.emit('start', event, context)
    return batchProcessor.start(event.cursor)
  })
  return Object.assign(handler, EventEmitter.prototype)
}
