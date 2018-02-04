const EventEmitter = require("events");

module.exports = class BatchProcessor extends EventEmitter {
  constructor(readItem, shouldContinue) {
    super();
    this.readItem = readItem;
    this.shouldContinue = shouldContinue;
  }

  async start(cursor) {
    let newCursor = cursor;

    do {
      const next = await this.readItem(newCursor);
      const item = next.item;
      newCursor = next.cursor;
      if (item) {
        this.emit("item", item);
      }

      if (next.finished) {
        return;
      }
    } while (this.shouldContinue(newCursor));

    this.emit("inProgress", newCursor);
  }
};
