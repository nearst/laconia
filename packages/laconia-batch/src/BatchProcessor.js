const EventEmitter = require('events')

module.exports = class BatchProcessor extends EventEmitter {
  constructor (readItem, shouldStop) {
    super()
    this.readItem = readItem
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
