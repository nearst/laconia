/* eslint-env jest */

const LambdaInvoker = require('../src/index.js')
const AWSMock = require('aws-sdk-mock')
const AWS = require('aws-sdk')

describe('aws invoke', () => {
  describe('fire and forget', () => {
    it('should throw an error when FunctionError is returned', () => {
      const invokeMock = jest.fn()
      AWSMock.mock('Lambda', 'invoke', invokeMock)
      const lambda = new AWS.Lambda()
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: 'Handled', Payload: 'boom'}))
      const invoker = new LambdaInvoker(lambda, 'myLambda')
      return expect(invoker.fireAndForget()).rejects
        .toThrow('Handled error returned by myLambda: boom')
    })

    it('should handle Unhandled Error as well')

    it('do not retry on error')

    it('should delegate InvocationType as Event')
    it('pass functionName')
    it('verifies status code 202')
    it('pass in payload')
  })

  describe('request response', () => {
    it('should delegate InvocationType as RequestResponse')
    it('verifies status code 200')
  })
})
