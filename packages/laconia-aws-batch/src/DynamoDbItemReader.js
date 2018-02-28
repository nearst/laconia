const assert = require('assert')

const QUERY = 'QUERY'
const SCAN = 'SCAN'
const unsupportedOperationMessage = 'Unsupported DynamoDB operation! Supported operations are SCAN and QUERY.'

module.exports = class DynamoDbItemReader {
  constructor (operation, documentClient, baseParams) {
    assert(operation === QUERY || operation === SCAN, unsupportedOperationMessage)
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
    return this.operation === QUERY
      ? this.documentClient.query(params).promise()
      : this.documentClient.scan(params).promise()
  }

  async _getDataFromDynamoDb (cursor) {
    const data = await this._hitDynamoDb(this._createDynamoDbParams(cursor))
    this.cachedItems = data.Items
    return data
  }

  _getDataFromCache (cursor) {
    return {
      Items: this.cachedItems,
      LastEvaluatedKey: cursor.lastEvaluatedKey
    }
  }

  _hasNextItem (items, currentIndex) { return currentIndex >= 0 && currentIndex + 1 <= items.length - 1 }

  _hasNextItemInCache (cursor) { return this._hasNextItem(this.cachedItems, cursor.index) }

  async next (cursor = {lastEvaluatedKey: undefined, index: -1}) {
    const [data, index] = this._hasNextItemInCache(cursor)
      ? [this._getDataFromCache(cursor), cursor.index + 1]
      : [await this._getDataFromDynamoDb(cursor), 0]
    const {Items: items, LastEvaluatedKey: lastEvaluatedKey} = data

    return {
      item: items[index],
      cursor: { lastEvaluatedKey, index },
      finished: lastEvaluatedKey === undefined && !this._hasNextItem(items, index)
    }
  }
}
