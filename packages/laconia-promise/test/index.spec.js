/* eslint-env jest */

const lp = require('../src/index.js')

describe('laconia promise', () => {
  describe('when there is no error', () => {
    it('should call callback with null', () => {
      const callback = jest.fn()

      return lp()({}, {}, callback).then(_ => {
        expect(callback).toBeCalledWith(null)
      })
    })
  })
})
