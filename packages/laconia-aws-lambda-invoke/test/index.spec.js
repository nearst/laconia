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
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: 'Handled', Payload: 'boom', StatusCode: 202}))
      const invoker = new LambdaInvoker(lambda, 'myLambda')
      return expect(invoker.fireAndForget()).rejects.toThrow('Handled error returned by myLambda: boom')
    })

    it('should throw an error when FunctionError is set to Unhandled', () => {
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: 'Unhandled', Payload: 'boom', StatusCode: 202}))
      const invoker = new LambdaInvoker(lambda, 'myLambda')
      return expect(invoker.fireAndForget()).rejects.toThrow('Unhandled error returned by myLambda: boom')
    })

    describe('when invoking Lambda', () => {
      beforeEach(() => {
        invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: undefined, StatusCode: 202}))
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
      invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: undefined, StatusCode: 202}))
      const invoker = new LambdaInvoker(lambda, 'foobar')
      return invoker.fireAndForget().then(_ => {
        const invokeParams = invokeMock.mock.calls[0][0]
        expect(invokeParams).not.toHaveProperty('Payload')
      })
    })

    describe('when getting non 202 StatusCode', () => {
      const invalidStatusCodes = [200, 201, 203, 400, 401]
      invalidStatusCodes.forEach(statusCode => {
        it(`throws error when StatusCode returned is ${statusCode}`, () => {
          invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: undefined, StatusCode: statusCode}))
          const invoker = new LambdaInvoker(lambda, 'foobar')
          return expect(invoker.fireAndForget()).rejects.toThrow(`Status code returned was: ${statusCode}`)
        })
      })
    })
  })

  describe('request response', () => {
    it('should delegate InvocationType as RequestResponse')

    describe('when getting non 200 StatusCode', () => {
      const invalidStatusCodes = [201, 202, 203, 400, 401]
      invalidStatusCodes.forEach(statusCode => {
        it(`throws error when StatusCode returned is ${statusCode}`, () => {
          invokeMock.mockImplementation((params, callback) => callback(null, {FunctionError: undefined, StatusCode: statusCode}))
          const invoker = new LambdaInvoker(lambda, 'foobar')
          return expect(invoker.requestResponse()).rejects.toThrow(`Status code returned was: ${statusCode}`)
        })
      })
    })

    it('pass in payload')
    it('should try to returned JSON payload')
  })
})
