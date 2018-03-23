const get = require('lodash.get')
const _ = { get }

const extractS3JsonBody = data => {
  const fileContent = data.Body.toString()
  try {
    return JSON.parse(fileContent)
  } catch (e) {
    throw new Error(`Data stored in S3 is not a JSON!: ${JSON.stringify(fileContent)}`)
  }
}

const getArrayFromPath = (object, path) => {
  const items = path === '.' ? object : _.get(object, path)

  if (!Array.isArray(items)) {
    throw new Error(`Path '${path}' is not an array, it is '${JSON.stringify(items)}'`)
  }
  return items
}

module.exports = class S3ItemReader {
  constructor (s3, baseParams, path) {
    this.s3 = s3
    this.baseParams = baseParams
    this.path = path
    this.cachedItems = []
  }

  async _getItemsFromS3 () {
    const data = await this.s3.getObject(this.baseParams).promise()
    const items = getArrayFromPath(extractS3JsonBody(data), this.path)
    this.cachedItems = items
    return items
  }

  _hasNextItem (items, currentIndex) { return currentIndex >= 0 && currentIndex + 1 <= items.length - 1 }

  _hasNextItemInCache (cursor) { return this._hasNextItem(this.cachedItems, cursor.index) }

  async next (cursor = {index: -1}) {
    const items = this._hasNextItemInCache(cursor)
      ? this.cachedItems
      : await this._getItemsFromS3()
    const index = cursor.index + 1

    return {
      item: items[index],
      cursor: { index },
      finished: index + 1 > items.length - 1
    }
  }
}
