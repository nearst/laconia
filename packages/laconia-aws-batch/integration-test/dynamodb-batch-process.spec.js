/* eslint-env jest */

const DynamoDbLocal = require('dynamodb-local')

const AWSMock = require('aws-sdk-mock')
const AWS = require('aws-sdk')
const DynamoDbMusicRepository = require('./DynamoDbMusicRepository')
const {BatchProcessor, DynamoDbItemReader} = require('../src/index')

describe('dynamodb batch process', () => {
  const dynamoLocalPort = 8000
  const dynamoDbOptions = { region: 'eu-west-1', endpoint: new AWS.Endpoint(`http://localhost:${dynamoLocalPort}`) }
  let invokeMock, itemProcessor

  beforeAll(() => {
    jest.setTimeout(5000)
    return DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb'])
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

    itemProcessor = jest.fn()
  })

  afterEach(() => {
    AWSMock.restore()
  })

  it('should process all records in a Table with scan', async () => {
    const itemProcessor = jest.fn()
    const batchProcessor = new BatchProcessor(
      { functionName: 'blah', getRemainingTimeInMillis: () => 100000 },
      new DynamoDbItemReader(new AWS.DynamoDB.DocumentClient(dynamoDbOptions), {TableName: 'Music'}),
      itemProcessor,
      { timeNeededToRecurseInMillis: 5000 }
    )
    await batchProcessor.start()
    expect(itemProcessor).toHaveBeenCalledTimes(3)
    expect(itemProcessor).toHaveBeenCalledWith({Artist: 'Foo'})
    expect(itemProcessor).toHaveBeenCalledWith({Artist: 'Bar'})
    expect(itemProcessor).toHaveBeenCalledWith({Artist: 'Fiz'})
  })

  describe('when time is up', () => {
    beforeEach(async () => {
      const functionName = 'foo'
      const batchProcessor = new BatchProcessor(
        { functionName, getRemainingTimeInMillis: () => 3000 },
        new DynamoDbItemReader(new AWS.DynamoDB.DocumentClient(dynamoDbOptions), {TableName: 'Music'}),
        itemProcessor,
        { timeNeededToRecurseInMillis: 5000 }
      )
      await batchProcessor.start()
    })

    it('should stop processing when time is up', async () => {
      expect(itemProcessor).toHaveBeenCalledTimes(1)
    })

    it('should recurse when time is up', async () => {
      expect(invokeMock).toBeCalledWith(
        expect.objectContaining({
          FunctionName: 'foo',
          InvocationType: 'Event',
          Payload: JSON.stringify({cursor: {lastEvaluatedKey: {Artist: 'Fiz'}}})
        }),
        expect.any(Function)
      )
    })
  })

  describe('when recursing', () => {
    // pass cursor in
  })

  it('should forward event during recursion')

  it('should support query')

  it('CachedDynamoDbItemReader should not use Limit: 1 or should we return an array and process it all? Then setting Limit is becoming the user responsibility')

  it('should not return unefined item when lastEvaluatedKey is not empty')

  afterAll(() => {
    return DynamoDbLocal.stop(dynamoLocalPort)
  })
})
