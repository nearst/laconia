/* eslint-env jest */

const recursiveHandler = require('../src/recursiveHandler.js')
const AWSMock = require('aws-sdk-mock')

describe('aws recursive handler', () => {
  let callback, invokeMock

  beforeEach(() => {
    callback = jest.fn()
    beforeEach(() => {
      invokeMock = jest.fn()
      AWSMock.mock('Lambda', 'invoke', invokeMock)
    })
  })

  xit('should recurse', () => {
    const context = {functionName: 'foo'}
    const event = {}
    return recursiveHandler(() => ({ cursor: 5 }))(event, context, callback).then(_ => {
      expect(invokeMock).toBeCalledWith(
        expect.objectContaining({
          FunctionName: 'foo',
          InvocationType: 'Event',
          Payload: JSON.stringify({cursor: 5})
        }),
        expect.any(Function)
      )
    })
  })

  xit('should merge and take the returned object as precedence to event')
})
