/* eslint-env jest */

const AWSMock = require('aws-sdk-mock')
const s3BatchHandler = require('../src/s3-batch-handler')
const { sharedAcceptanceTest } = require('./batch-handler-helper')
const { s3Body } = require('laconia-test-helper')

describe('s3 batch handler acceptance', () => {
  let s3

  beforeEach(() => {
    s3 = { getObject: jest.fn().mockImplementation(s3Body(
      {
        music: [
          {Artist: 'Foo'},
          {Artist: 'Bar'},
          {Artist: 'Fiz'}
        ]
      }
      ))
    }
    AWSMock.mock('S3', 'getObject', s3.getObject)
  })

  afterEach(() => {
    AWSMock.restore()
  })

  sharedAcceptanceTest(() => {
    return s3BatchHandler(
      'music',
      {
        Bucket: 'foo',
        Key: 'bar'
      }
    )
  })
})
