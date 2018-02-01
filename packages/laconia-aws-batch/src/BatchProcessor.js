module.exports = class BatchProcessor {
  constructor (readItem, processItem, shouldContinue) {
    this.readItem = readItem
    this.processItem = processItem
    this.shouldContinue = shouldContinue
  }

  async start (cursor) {
    let newCursor = cursor

    do {
      const next = await this.readItem(newCursor)
      const item = next.item
      newCursor = next.cursor
      if (item) {
        this.processItem(item)
      }

      if (next.finished) {
        break
      }
    } while (this.shouldContinue(newCursor))

    if (!newCursor.finished) { // TODO: This has never worked, newCursor doesn't have finished property
      return newCursor
    }
  }
}
