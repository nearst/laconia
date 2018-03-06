/* eslint-env jest */

const recursiveHandler = require('../src/recursive-handler')
const AWSMock = require('aws-sdk-mock')

describe('recursive handler', () => {
  let callback, invokeMock

  beforeEach(() => {
    callback = jest.fn()
    invokeMock = jest.fn()
    AWSMock.mock('Lambda', 'invoke', invokeMock)
  })

  afterEach(() => {
    AWSMock.restore()
  })

  it('should call Lambda callback with null when there is no value returned', async () => {
    await recursiveHandler(() => {})({}, {}, callback)
    expect(callback).toBeCalledWith(null, undefined)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should delegate AWS parameters to handler function', async () => {
    const handler = jest.fn()
    await recursiveHandler(handler)({foo: 'bar'}, {fiz: 'baz'}, callback)
    expect(handler).toBeCalledWith({foo: 'bar'}, {fiz: 'baz'}, expect.any(Function))
  })

  it('should return error to callback when lambda recursion failed')

  it('provides recurse callback', async () => {
    const context = {functionName: 'foo'}
    const event = {}
    await recursiveHandler((event, context, recurse) => {
      recurse('payload')
    })(event, context, callback)

    expect(invokeMock).toBeCalledWith(
      expect.objectContaining({
        FunctionName: 'foo',
        InvocationType: 'Event',
        Payload: JSON.stringify('payload')
      }),
      expect.any(Function)
    )
  })

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

  it('should not recurse when value returned is undefined') // Is this too dangerous for an API? Should we just not implement this?

  xit('should merge and take the returned object as precedence to event (should forward event)')
})
