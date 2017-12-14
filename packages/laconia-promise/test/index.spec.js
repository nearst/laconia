/* eslint-env jest */

const lp = require('../src/index.js')

describe('laconia promise', () => {
  describe('when there is no error', () => {
    let callback, handler

    beforeEach(() => {
      handler = jest.fn()
      callback = jest.fn()
    })

    it('should call AWS Lambda callback with null', () => {
      return lp(handler)({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(null)
      })
    })

    it('should call wrapped function with the exact parameters', () => {
      return lp(handler)({}, {}, callback).then(_ => {
        expect(handler).toBeCalledWith({}, {}, callback)
      })
    })
  })
})
