/* eslint-env jest */

const lp = require('../src/index.js')

describe('laconia promise', () => {
  let callback, handler

  beforeEach(() => {
    handler = jest.fn()
    callback = jest.fn()
  })

  describe('when there is no error', () => {
    it('should call Lambda callback with null when there is no value returned', () => {
      return lp(handler)({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(null, undefined)
        expect(callback).toHaveBeenCalledTimes(1)
      })
    })

    it('should return the handler return value to Lambda callback', () => {
      handler.mockReturnValueOnce('value')
      return lp(handler)({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(null, 'value')
      })
    })

    it('should return the handler Promise return value to Lambda callback', () => {
      handler.mockReturnValueOnce(Promise.resolve('value'))
      return lp(handler)({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(null, 'value')
      })
    })

    it('should call handler function with the exact parameters', () => {
      return lp(handler)({}, {}, callback).then(_ => {
        expect(handler).toBeCalledWith({}, {}, callback)
      })
    })
  })

  describe('when there is error', () => {
    it('should call Lambda callback with the error', () => {
      const error = new Error('boom')
      return lp(() => { throw error })({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(error)
      })
    })
  })
})
