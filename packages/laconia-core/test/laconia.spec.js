const laconia = require('../src/laconia')

describe('handler', () => {
  let callback

  beforeEach(() => {
    callback = jest.fn()
  })

  it('should call Lambda callback with null when there is no value returned', async () => {
    await laconia(() => {})({}, {}, callback)
    expect(callback).toBeCalledWith(null, undefined)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should delegate AWS parameters to handler function', async () => {
    const handler = jest.fn()
    await laconia(handler)({foo: 'event'}, {fiz: 'context'}, callback)
    expect(handler).toBeCalledWith({event: {foo: 'event'}, context: {fiz: 'context'}})
  })

  describe('when synchronous code', () => {
    it('should call Lambda callback with the handler return value to Lambda callback', async () => {
      await laconia(() => 'value')({}, {}, callback)
      expect(callback).toBeCalledWith(null, 'value')
    })

    it('should call Lambda callback with the error thrown', async () => {
      const error = new Error('boom')
      await laconia(() => { throw error })({}, {}, callback)
      expect(callback).toBeCalledWith(error)
    })
  })

  describe('when handling promise', () => {
    it('should call Lambda callback with the handler return value to Lambda callback', async () => {
      await laconia(() => Promise.resolve('value'))({}, {}, callback)
      expect(callback).toBeCalledWith(null, 'value')
    })

    it('should call Lambda callback with the error thrown', async () => {
      const error = new Error('boom')
      await laconia(() => Promise.reject(error))({}, {}, callback)
      expect(callback).toBeCalledWith(error)
    })
  })
})
