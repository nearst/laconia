const BatchProcessor = require('../src/BatchProcessor')
const { matchers } = require('laconia-test-helper')
expect.extend(matchers)

describe('BatchProcessor', () => {
  let itemListener
  let shouldStop

  beforeEach(() => {
    itemListener = jest.fn()
    shouldStop = jest.fn()
  })

  it('fires item event', async () => {
    const item = 'foo'
    const batchProcessor = new BatchProcessor(
      () => (Promise.resolve({item, finished: true})),
      shouldStop
    )
      .on('item', itemListener)
    await batchProcessor.start()

    expect(itemListener).toBeCalledWith(item)
  })

  describe('when multiple items were returned', () => {
    beforeEach(() => {
      const batchProcessor = new BatchProcessor(
        jest.fn()
          .mockImplementationOnce(() => (Promise.resolve({item: '1', finished: false})))
          .mockImplementationOnce(() => (Promise.resolve({item: '2', finished: false})))
          .mockImplementationOnce(() => (Promise.resolve({item: '3', finished: true}))),
        shouldStop
      )
        .on('item', itemListener)
      return batchProcessor.start()
    })

    it('fires multiple item events', async () => {
      expect(itemListener).toBeCalledWith('1')
      expect(itemListener).toBeCalledWith('2')
      expect(itemListener).toBeCalledWith('3')
    })

    it('is not rate limited by default', () => {
      expect(itemListener).toBeCalledWithGapBetween(0, 5)
    })
  })

  describe('when rate limited', () => {
    it('should process items with delay', async () => {
      const batchProcessor = new BatchProcessor(
        jest.fn()
          .mockImplementationOnce(() => (Promise.resolve({item: '1', finished: false})))
          .mockImplementationOnce(() => (Promise.resolve({item: '2', finished: false})))
          .mockImplementationOnce(() => (Promise.resolve({item: '3', finished: true}))),
        shouldStop,
        {
          itemsPerSecond: 10
        }
      )
        .on('item', itemListener)
      await batchProcessor.start()

      expect(itemListener).toBeCalledWithGapBetween(5, 110)
    })
  })
})
