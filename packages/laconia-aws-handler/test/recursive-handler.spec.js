/* eslint-env jest */

const { yields } = require('laconia-test-helper')
const recursiveHandler = require('../src/recursive-handler')
const AWSMock = require('aws-sdk-mock')

describe('recursive handler', () => {
  let context, callback, invokeMock

  beforeEach(() => {
    callback = jest.fn()
    context = { functionName: 'foo' }
    invokeMock = jest.fn().mockImplementation(yields({ StatusCode: 202 }))
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

  it('recurses when the recurse callback is called', async () => {
    await recursiveHandler((event, context, recurse) => recurse())({}, context, callback)

    expect(invokeMock).toBeCalledWith(
      expect.objectContaining({
        FunctionName: 'foo',
        InvocationType: 'Event'
      }),
      expect.any(Function)
    )
  })

  it('throws error when lambda recursion failed', async () => {
    const error = new Error('boom')
    invokeMock.mockImplementation(() => { throw error })
    await recursiveHandler((event, context, recurse) => recurse())({}, context, callback)
    expect(callback).toBeCalledWith(error)
  })

  it('throws error when payload given is not an object', async () => {
    await recursiveHandler((event, context, recurse) => recurse('non object'))({}, context, callback)
    expect(callback).toBeCalledWith(expect.any(Error))
    const error = callback.mock.calls[0][0]
    expect(error.message).toContain('Payload must be an object')
  })

  it('should merge recurse payload and event object', async () => {
    await recursiveHandler((event, context, recurse) => {
      recurse({cursor: {index: 0, lastEvaluatedKey: 'bar'}})
    })({key1: '1', key2: '2'}, context, callback)

    expect(invokeMock).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(invokeMock.mock.calls[0][0].Payload)
    expect(payload).toEqual({
      key1: '1',
      key2: '2',
      cursor: {index: 0, lastEvaluatedKey: 'bar'}
    })
  })

  it('should be able to not call recurse function')
})
