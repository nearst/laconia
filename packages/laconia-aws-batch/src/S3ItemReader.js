const _ = require('lodash')

module.exports = class S3ItemReader {
  constructor (s3, baseParams, path) {
    this.s3 = s3
    this.baseParams = baseParams
    this.path = path
  }

  async next (cursor = {index: -1}) {
    const data = await this.s3.getObject(this.baseParams).promise()
    const fileContent = data.Body.toString()
    const object = JSON.parse(fileContent)
    const index = cursor.index + 1

    const items = _.get(object, this.path)

    return {
      item: items[index],
      cursor: { index },
      finished: index + 1 > items.length - 1
    }
  }
}
