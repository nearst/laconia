/* eslint-env jest */
const AWSMock = require('aws-sdk-mock')
const AWS = require('aws-sdk')
const DynamoDbItemReader = require('../src/DynamoDbItemReader')
const { yields } = require('laconia-test-helper')

describe('DynamoDb Item Reader', () => {
  let documentClient
  const dynamoDbParams = {Bucket: 'bucket', Key: 'key'}

  beforeEach(() => {
    documentClient = {
      query: jest.fn().mockImplementation(yields({Items: []})),
      scan: jest.fn().mockImplementation(yields({Items: []}))
    }
    AWSMock.mock('DynamoDB.DocumentClient', 'query', documentClient.query)
    AWSMock.mock('DynamoDB.DocumentClient', 'scan', documentClient.scan)
  })

  afterEach(() => {
    AWSMock.restore()
  })

  it('queries DynamoDb when QUERY operation is used', async () => {
    const reader = new DynamoDbItemReader('QUERY', new AWS.DynamoDB.DocumentClient(), dynamoDbParams)
    await reader.next()

    expect(documentClient.scan).not.toHaveBeenCalled()
    expect(documentClient.query).toHaveBeenCalled()
  })

  it('scans DynamoDb when SCAN operation is used', async () => {
    const reader = new DynamoDbItemReader('SCAN', new AWS.DynamoDB.DocumentClient(), dynamoDbParams)
    await reader.next()

    expect(documentClient.query).not.toHaveBeenCalled()
    expect(documentClient.scan).toHaveBeenCalled()
  })

  it('throws error when operation is not supported', async () => {
    expect(() =>
      new DynamoDbItemReader('BOOM', new AWS.DynamoDB.DocumentClient(), dynamoDbParams)
    )
    .toThrow('Unsupported DynamoDB operation! Supported operations are SCAN and QUERY.')
  })

  it('generates next object', async () => {
    documentClient.scan.mockImplementation(yields({Items: ['Foo']}))
    const reader = new DynamoDbItemReader('SCAN', new AWS.DynamoDB.DocumentClient(), dynamoDbParams)
    const next = await reader.next()

    expect(next).toEqual({ item: 'Foo', cursor: { index: 0 }, finished: true })
  })

  describe('when multiple items are returned', () => {
    it('generates nexts object with the correct content')
    it('should cache result')
  })

  describe('when start reading in the middle', () => {
    it('sets ExclusiveStartKey based on the parameter set')
    it('should cache result')
  })
})
