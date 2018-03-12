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
    this.cachedData = {};
    this.initialized = false;
  }

  _createDynamoDbParams(exclusiveStartKey) {
    return Object.assign(
      { ExclusiveStartKey: exclusiveStartKey },
      this.baseParams
    );
  }

  async _hitAndCacheDynamoDb(params) {
    const data =
      this.operation === QUERY
        ? await this.documentClient.query(params).promise()
        : await this.documentClient.scan(params).promise();
    this.cachedData = data;
    return data;
  }

  async _getDataFromDynamoDb(cursor) {
    return this._hitAndCacheDynamoDb(
      this._createDynamoDbParams(cursor.lastEvaluatedKey)
    );
  }

  async _init(cursor) {
    if (!this.initialized) {
      await this._hitAndCacheDynamoDb(
        this._createDynamoDbParams(cursor.exclusiveStartKey)
      );
      this.initialized = true;
    }
  }

  _getDataFromCache() {
    return this.cachedData;
  }

  _hasNextItem(items, currentIndex) {
    return currentIndex + 1 <= items.length - 1;
  }

  _hasNextItemInCache(cursor) {
    return this._hasNextItem(this.cachedData.Items, cursor.index);
  }

  async next(
    cursor = {
      lastEvaluatedKey: undefined,
      exclusiveStartKey: undefined,
      index: -1
    }
  ) {
    await this._init(cursor);

    const [data, index, exclusiveStartKey] = this._hasNextItemInCache(cursor)
      ? [this._getDataFromCache(), cursor.index + 1, cursor.exclusiveStartKey]
      : [await this._getDataFromDynamoDb(cursor), 0, cursor.lastEvaluatedKey];
    const { LastEvaluatedKey: lastEvaluatedKey, Items: items } = data;

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
