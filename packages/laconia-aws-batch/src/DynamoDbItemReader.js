const assert = require("assert");

const QUERY = "QUERY";
const SCAN = "SCAN";
const unsupportedOperationMessage =
  "Unsupported DynamoDB operation! Supported operations are SCAN and QUERY.";

module.exports = class DynamoDbItemReader {
  constructor(operation, documentClient, baseParams) {
    assert(
      operation === QUERY || operation === SCAN,
      unsupportedOperationMessage
    );
    this.operation = operation;
    this.documentClient = documentClient;
    this.baseParams = baseParams;
    this.cachedItems = [];
    this.initialized = false;
  }

  _createDynamoDbParams(exclusiveStartKey) {
    const params = Object.assign({}, this.baseParams);
    if (exclusiveStartKey) {
      params.ExclusiveStartKey = exclusiveStartKey;
    }
    return params;
  }

  async _hitDynamoDb(params) {
    return this.operation === QUERY
      ? this.documentClient.query(params).promise()
      : this.documentClient.scan(params).promise();
  }

  async _getDataFromDynamoDb(cursor) {
    const data = await this._hitDynamoDb(
      this._createDynamoDbParams(cursor.lastEvaluatedKey)
    );
    this.cachedItems = data.Items;
    return data;
  }

  async _init(cursor) {
    if (!this.initialized) {
      const data = await this._hitDynamoDb(
        this._createDynamoDbParams(cursor.exclusiveStartKey)
      );
      this.cachedItems = data.Items;
      this.initialized = true;
      return data;
    }
  }

  _getDataFromCache(cursor) {
    return {
      Items: this.cachedItems,
      LastEvaluatedKey: cursor.lastEvaluatedKey
    };
  }

  _hasNextItem(items, currentIndex) {
    return currentIndex + 1 <= items.length - 1;
  }

  _hasNextItemInCache(cursor) {
    return this._hasNextItem(this.cachedItems, cursor.index);
  }

  async next(
    cursor = {
      lastEvaluatedKey: undefined,
      exclusiveStartKey: undefined,
      index: -1
    }
  ) {
    let lastEvaluatedKey;
    if (!this.initialized) {
      const data = await this._init(cursor);
      lastEvaluatedKey = data.LastEvaluatedKey;
    }

    const [data, index, exclusiveStartKey] = this._hasNextItemInCache(cursor)
      ? [
          this._getDataFromCache(cursor),
          cursor.index + 1,
          cursor.exclusiveStartKey
        ]
      : [await this._getDataFromDynamoDb(cursor), 0, cursor.lastEvaluatedKey];
    if (!lastEvaluatedKey) {
      lastEvaluatedKey = data.LastEvaluatedKey;
    }
    const items = data.Items;

    return {
      item: items[index],
      cursor: {
        exclusiveStartKey: exclusiveStartKey,
        lastEvaluatedKey: lastEvaluatedKey,
        index
      },
      finished:
        lastEvaluatedKey === undefined && !this._hasNextItem(items, index)
    };
  }
};
