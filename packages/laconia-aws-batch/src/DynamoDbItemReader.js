module.exports.SCAN = 'SCAN'
module.exports.QUERY = 'QUERY'

module.exports = class DynamoDbItemReader {
  constructor (operation, documentClient, baseParams) {
    this.operation = operation // TODO: validate operation
    this.documentClient = documentClient
    this.baseParams = baseParams
    this.cachedItems = []
  }

  _createDynamoDbParams (cursor) {
    const params = Object.assign({}, this.baseParams)
    if (cursor.lastEvaluatedKey) {
      params.ExclusiveStartKey = cursor.lastEvaluatedKey
    }
    return params
  }

  async _hitDynamoDb (params) {
    return this.operation === exports.QUERY
      ? this.documentClient.query(params).promise()
      : this.documentClient.scan(params).promise()
  }

  async next (cursor = {lastEvaluatedKey: undefined, index: -1}) {
    let data, index

    if (cursor.index < 0 || cursor.index + 1 > this.cachedItems.length - 1) {
      data = await this._hitDynamoDb(this._createDynamoDbParams(cursor))
      this.cachedItems = data.Items
      index = 0
    } else {
      data = {
        Items: this.cachedItems,
        LastEvaluatedKey: cursor.lastEvaluatedKey
      }
      index = cursor.index + 1
    }

    const {Items: items, LastEvaluatedKey: lastEvaluatedKey} = data
    const item = items[index]

    return {
      item,
      cursor: { lastEvaluatedKey, index },
      finished: lastEvaluatedKey === undefined && index + 1 > items.length - 1
    }
  }
}
