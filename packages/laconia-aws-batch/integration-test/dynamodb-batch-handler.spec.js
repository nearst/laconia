/* eslint-env jest */

const DynamoDbLocal = require('dynamodb-local')

const AWS = require('aws-sdk')
const DynamoDbMusicRepository = require('./DynamoDbMusicRepository')
const { sharedAcceptanceTest } = require('../acceptance-test/batch-handler-helper')
const {dynamoDbBatchHandler} = require('../src/dynamodb-batch-handler')

describe('dynamodb batch handler', () => {
  const dynamoLocalPort = 8000
  const dynamoDbOptions = { region: 'eu-west-1', endpoint: new AWS.Endpoint(`http://localhost:${dynamoLocalPort}`) }
  let itemListener, event, context, callback, handlerOptions

  beforeAll(() => {
    jest.setTimeout(5000)
    return DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb'])
  })

  afterAll(() => {
    return DynamoDbLocal.stop(dynamoLocalPort)
  })

  beforeAll(async () => {
    const musicRepository = new DynamoDbMusicRepository(
      new AWS.DynamoDB(dynamoDbOptions),
      new AWS.DynamoDB.DocumentClient(dynamoDbOptions)
    )

    await musicRepository.createTable()
    await musicRepository.save({Artist: 'Foo'})
    await musicRepository.save({Artist: 'Bar'})
    await musicRepository.save({Artist: 'Fiz'})
  })

  beforeEach(() => {
    itemListener = jest.fn()
    event = {}
    context = { functionName: 'blah', getRemainingTimeInMillis: () => 100000 }
    callback = jest.fn()
    handlerOptions = { documentClient: new AWS.DynamoDB.DocumentClient(dynamoDbOptions) }
  })

  sharedAcceptanceTest(() => {
    return dynamoDbBatchHandler(
      'SCAN',
      { TableName: 'Music' },
      handlerOptions
    )
  })

  it('should support query operation', async () => {
    await dynamoDbBatchHandler(
      'QUERY',
      {
        ExpressionAttributeValues: {
          ':v1': 'Fiz'
        },
        KeyConditionExpression: 'Artist = :v1',
        TableName: 'Music'
      },
      handlerOptions
    )
    .on('item', itemListener)(event, context, callback)

    expect(itemListener).toHaveBeenCalledTimes(1)
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Fiz'})
  })

  it('should be able to process all items when Limit is set to 1', async () => {
    await dynamoDbBatchHandler(
      'SCAN',
      {
        TableName: 'Music',
        Limit: 1
      },
      handlerOptions
    )
    .on('item', itemListener)(event, context, callback)

    expect(itemListener).toHaveBeenCalledTimes(3)
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Foo'})
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Bar'})
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Fiz'})
  })

  it('should be able to process items when filtered', async () => {
    await dynamoDbBatchHandler(
      'SCAN',
      {
        TableName: 'Music',
        Limit: 1,
        ExpressionAttributeValues: {
          ':a': 'Bar'
        },
        FilterExpression: 'Artist = :a'
      },
      handlerOptions
    )
    .on('item', itemListener)(event, context, callback)

    expect(itemListener).toHaveBeenCalledTimes(1)
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Bar'})
  })

  it('should process all items when filtered with complete recursion')
  it('should process all items when filtered and limited with complete recursion')
})
