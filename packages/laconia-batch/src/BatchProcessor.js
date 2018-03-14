const EventEmitter = require('events')
const Bottleneck = require('bottleneck')

const rateLimit = (fn, itemPerSecond) => {
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1000 / itemPerSecond
  })
  return limiter.wrap(fn)
}

module.exports = class BatchProcessor extends EventEmitter {
  constructor (readItem, shouldStop, { itemsPerSecond = 0 } = {}) {
    super()
    this.readItem = itemsPerSecond === 0 ? readItem : rateLimit(readItem, itemsPerSecond)
    this.shouldStop = shouldStop
  }

  async start (cursor) {
    let prevCursor = cursor

    do {
      const {item, cursor, finished} = await this.readItem(prevCursor)

      if (item) {
        this.emit('item', item)
      }

      if (finished) {
        this.emit('end')
        return
      }

      if (this.shouldStop(cursor)) {
        this.emit('stop', cursor)
        return
      }

      prevCursor = cursor
    } while (true)
  }
}
