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

    describe('when invoking Lambda', () => {
      beforeEach(() => {
        invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: undefined}))
        const invoker = new LambdaInvoker(lambda, 'foobar')
        return invoker.fireAndForget({biz: 'baz'})
      })

      it('should set InvocationType parameter', () => {
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({InvocationType: 'Event'}),
          expect.any(Function)
        )
      })

      it('should set FunctionName parameter', () => {
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({FunctionName: 'foobar'}),
          expect.any(Function)
        )
      })

      it('should set and stringify Payload parameter', () => {
        expect(invokeMock).toBeCalledWith(
          expect.objectContaining({Payload: JSON.stringify({biz: 'baz'})}),
          expect.any(Function)
        )
      })
    })

    it('should not set Payload parameter if it is not available', () => {
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: undefined}))
      const invoker = new LambdaInvoker(lambda, 'foobar')
      return invoker.fireAndForget().then(_ => {
        const invokeParams = invokeMock.mock.calls[0][0]
        expect(invokeParams).not.toHaveProperty('Payload')
      })
    })

    xit('throws error when StatusCode returned is not 202', () => {
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: undefined, StatusCode: 400}))
      const invoker = new LambdaInvoker(lambda, 'foobar')
      return expect(invoker.fireAndForget()).rejects.toThrow('Status code returned was: 400')
    })
  })

  describe('request response', () => {
    it('should delegate InvocationType as RequestResponse')
    it('verifies status code 200')
    it('pass in payload')
  })
})
