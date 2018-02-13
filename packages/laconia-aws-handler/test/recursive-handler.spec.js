/* eslint-env jest */

const recursiveHandler = require('../src/recursive-handler')
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

  xit('provide recurse callback')

  xit('should recurse when value returned is not undefined', async () => {
    const context = {functionName: 'foo'}
    const event = {}
    await recursiveHandler(() => ({ cursor: 5 }))(event, context, callback)
    expect(invokeMock).toBeCalledWith(
      expect.objectContaining({
        FunctionName: 'foo',
        InvocationType: 'Event',
        Payload: JSON.stringify({cursor: 5})
      }),
      expect.any(Function)
    )
  })

  xit('should merge and take the returned object as precedence to event (should forward event)')
})
