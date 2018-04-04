const _ = require('lodash')
const invoke = require('laconia-invoke')
const tracker = require('laconia-test-helper').tracker

const prefix = 'laconia-acceptance-test'
const name = name => `${prefix}-${name}`
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const documentClient = new AWS.DynamoDB.DocumentClient()

const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const getRequestIds = ticks => _.uniq(ticks.map(t => t.context.awsRequestId))

jest.setTimeout(10000)

describe('laconia-core basicHandler', () => {
  it('returns result', async () => {
    const result = await invoke(name('handler-basic')).requestResponse()
    expect(result).toEqual('hello')
  })
})

describe('laconia-core recursiveHandler', () => {
  const recursiveTracker = tracker('recursive', name('tracker'))

  beforeAll(() => recursiveTracker.clear())

  it('recurses three times', async () => {
    await invoke(name('handler-recursive')).fireAndForget({input: 1})
    await recursiveTracker.waitUntil(3)
    expect(await recursiveTracker.getTotal()).toEqual(3)
  })
})

describe('laconia-batch s3-batch-handler', () => {
  const s3BatchTracker = tracker('batch-s3', name('tracker'))

  beforeAll(() => s3.putObject({
    Bucket: name('bucket'),
    Key: 'batch-s3.json',
    Body: JSON.stringify(items)
  }).promise())

  beforeAll(() => s3BatchTracker.clear())

  const getItems = ticks => ticks.map(t => t.item)

  it('processes all items', async () => {
    await invoke(name('batch-s3')).fireAndForget()
    await s3BatchTracker.waitUntil(10)

    const ticks = await s3BatchTracker.getTicks()
    expect(getRequestIds(ticks).length).toBeGreaterThanOrEqual(3)
    expect(getItems(ticks)).toEqual(items)
  })
})

describe('laconia-batch dynamodb-batch-handler', () => {
  const dynamoDbBatchTracker = tracker('batch-dynamoDb', name('tracker'))

  beforeAll(() => documentClient.batchWrite({
    RequestItems: {
      [name('batch')]: items.map(i => _.set({}, 'PutRequest.Item.ArtistId', i))
    }
  }).promise())

  beforeAll(() => dynamoDbBatchTracker.clear())

  const getArtistIds = ticks => ticks.map(t => t.item.ArtistId).sort()

  it('processes all items', async () => {
    await invoke(name('batch-dynamodb')).fireAndForget()
    await dynamoDbBatchTracker.waitUntil(10)

    const ticks = await dynamoDbBatchTracker.getTicks()
    expect(getRequestIds(ticks).length).toBeGreaterThanOrEqual(3)
    expect(getArtistIds(ticks)).toEqual(items)
  })
})
