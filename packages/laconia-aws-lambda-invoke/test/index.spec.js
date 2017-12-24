/* eslint-env jest */

const LambdaInvoker = require('../src/index.js')
const AWSMock = require('aws-sdk-mock')
const AWS = require('aws-sdk')

describe('aws invoke', () => {
  let invokeMock
  let lambda

  beforeEach(() => {
    invokeMock = jest.fn()
    AWSMock.mock('Lambda', 'invoke', invokeMock)
    lambda = new AWS.Lambda()
  })

  afterEach(() => {
    AWSMock.restore()
  })

  describe('fire and forget', () => {
    it('should throw an error when FunctionError is set to Handled', () => {
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: 'Handled', Payload: 'boom'}))
      const invoker = new LambdaInvoker(lambda, 'myLambda')
      return expect(invoker.fireAndForget()).rejects.toThrow('Handled error returned by myLambda: boom')
    })

    it('should throw an error when FunctionError is set to Unhandled', () => {
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: 'Unhandled', Payload: 'boom'}))
      const invoker = new LambdaInvoker(lambda, 'myLambda')
      return expect(invoker.fireAndForget()).rejects.toThrow('Unhandled error returned by myLambda: boom')
    })

    it('should invoke Lambda with InvocationType parameter', () => {
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: undefined}))
      const invoker = new LambdaInvoker(lambda, 'myLambda')
      return invoker.fireAndForget().then(_ => {
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({InvocationType: 'Event'}),
          expect.any(Function)
        )
      })
    })

    it('should invoke Lambda with FunctionName parameter', () => {
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: undefined}))
      const invoker = new LambdaInvoker(lambda, 'foobar')
      return invoker.fireAndForget().then(_ => {
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({FunctionName: 'foobar'}),
          expect.any(Function)
        )
      })
    })

    it('throws error when StatusCode returned is not 202')
    it('pass in payload')
  })

  describe('request response', () => {
    it('should delegate InvocationType as RequestResponse')
    it('verifies status code 200')
    it('pass in payload')
  })
})
