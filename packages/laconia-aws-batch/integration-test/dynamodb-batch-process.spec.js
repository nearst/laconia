/* eslint-env jest */

const DynamoDbLocal = require('dynamodb-local')

const AWSMock = require('aws-sdk-mock')
const AWS = require('aws-sdk')
const DynamoDbMusicRepository = require('./DynamoDbMusicRepository')
const {dynamoDbBatchHandler} = require('../src/index')

describe('dynamodb batch process', () => {
  const dynamoLocalPort = 8000
  const dynamoDbOptions = { region: 'eu-west-1', endpoint: new AWS.Endpoint(`http://localhost:${dynamoLocalPort}`) }
  let invokeMock, itemListener, event, context, callback, handlerOptions, stopListener, endListener, startListener

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
    invokeMock = jest.fn()
    AWSMock.mock('Lambda', 'invoke', invokeMock)

    itemListener = jest.fn()
    stopListener = jest.fn()
    endListener = jest.fn()
    startListener = jest.fn()
    event = {}
    context = { functionName: 'blah', getRemainingTimeInMillis: () => 100000 }
    callback = jest.fn()
    handlerOptions = { documentClient: new AWS.DynamoDB.DocumentClient(dynamoDbOptions) }
  })

  afterEach(() => {
    AWSMock.restore()
  })

  describe('when no recursion is needed', () => {
    beforeEach(async () => {
      await dynamoDbBatchHandler(
        'SCAN',
        { TableName: 'Music' },
        handlerOptions
      )
      .on('start', startListener)
      .on('item', itemListener)
      .on('stop', stopListener)
      .on('end', endListener)(event, context, callback)
    })

    it('should notify listeners on lifecycle events', () => {
      expect(startListener).toHaveBeenCalledTimes(1)
      expect(startListener).toHaveBeenCalledWith(event, context)
      expect(endListener).toHaveBeenCalledTimes(1)
      expect(stopListener).not.toHaveBeenCalled()

      expect(startListener).toHaveBeenCalledBefore(itemListener)
      expect(startListener).toHaveBeenCalledBefore(endListener)
    })

    it('should process all records in a Table with scan', async () => {
      expect(itemListener).toHaveBeenCalledTimes(3)
      expect(itemListener).toHaveBeenCalledWith({Artist: 'Foo'}, event, context)
      expect(itemListener).toHaveBeenCalledWith({Artist: 'Bar'}, event, context)
      expect(itemListener).toHaveBeenCalledWith({Artist: 'Fiz'}, event, context)
    })

    it('should not recurse', () => {
      expect(invokeMock).not.toHaveBeenCalled()
    })
  })

  describe('when time is up', () => {
    beforeEach(async () => {
      context.getRemainingTimeInMillis = () => 5000
      await dynamoDbBatchHandler(
        'SCAN',
        { TableName: 'Music' },
        handlerOptions
      )
      .on('start', startListener)
      .on('item', itemListener)
      .on('stop', stopListener)
      .on('end', endListener)(event, context, callback)
    })

    it('should stop processing when time is up', async () => {
      expect(itemListener).toHaveBeenCalledTimes(1)
    })

    it('should notify listeners on lifecycle events', () => {
      expect(startListener).toHaveBeenCalledTimes(1)
      expect(stopListener).toHaveBeenCalledTimes(1)
      expect(stopListener).toHaveBeenCalledWith({ index: 0, lastEvaluatedKey: undefined })
      expect(endListener).not.toHaveBeenCalled()

      expect(startListener).toHaveBeenCalledBefore(itemListener)
      expect(startListener).toHaveBeenCalledBefore(stopListener)
    })

    it('should recurse when time is up', async () => {
      expect(invokeMock).toBeCalledWith(
        expect.objectContaining({
          FunctionName: context.functionName,
          InvocationType: 'Event',
          Payload: JSON.stringify({cursor: {index: 0}})
        }),
        expect.any(Function)
      )
    })
  })

  it('should support query', async () => {
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
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Fiz'}, event, context)
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
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Foo'}, event, context)
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Bar'}, event, context)
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Fiz'}, event, context)
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
    expect(itemListener).toHaveBeenCalledWith({Artist: 'Bar'}, event, context)
  })

  describe('when completing recursion', () => {
    it('should process all items', async (done) => {
      context.getRemainingTimeInMillis = () => 5000
      const handler = dynamoDbBatchHandler(
        'SCAN',
        {
          TableName: 'Music',
          Limit: 1
        },
        handlerOptions
      )
      .on('item', itemListener)

      handler(event, context, callback)
      invokeMock.mockImplementationOnce(event => handler(JSON.parse(event.Payload), context, callback))
      invokeMock.mockImplementationOnce(event => handler(JSON.parse(event.Payload), context, callback))
      invokeMock.mockImplementationOnce(async (event) => {
        await handler(JSON.parse(event.Payload), context, callback)

        expect(invokeMock).toHaveBeenCalledTimes(3)
        expect(itemListener).toHaveBeenCalledTimes(3)
        expect(itemListener).toHaveBeenCalledWith({Artist: 'Foo'}, expect.anything(), expect.anything())
        expect(itemListener).toHaveBeenCalledWith({Artist: 'Bar'}, expect.anything(), expect.anything())
        expect(itemListener).toHaveBeenCalledWith({Artist: 'Fiz'}, expect.anything(), expect.anything())
        done()
      })
    })
  })
})
