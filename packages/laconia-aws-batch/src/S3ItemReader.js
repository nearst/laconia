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

    return {
      item: object.database.music.list[index],
      cursor: { index },
      finished: index + 1 > object.database.music.list.length - 1
    }
  }
}
