const BatchProcessor = require('../src/BatchProcessor')
const { matchers } = require('laconia-test-helper')
expect.extend(matchers)

const arrayReader = (array) =>
  array.reduce((reader, item, index) => {
    const finished = index === array.length - 1
    return reader.mockImplementationOnce(() => (Promise.resolve({item, finished})))
  }, jest.fn())

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
        arrayReader(['1', '2', '3']),
        shouldStop
      ).on('item', itemListener)
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
    const createBatchProcessor = (itemsPerSecond) =>
      new BatchProcessor(
        arrayReader(['1', '2', '3']),
        shouldStop,
        { itemsPerSecond }
      ).on('item', itemListener)

    it('should process items with delay', async () => {
      const batchProcessor = createBatchProcessor(50)
      await batchProcessor.start()

      expect(itemListener).toBeCalledWithGapBetween(5, 25)
    })

    it('should support 1000 itemsPerSecond', async () => {
      const batchProcessor = createBatchProcessor(1000)
      await batchProcessor.start()

      expect(itemListener).toBeCalledWithGapBetween(0, 10)
    })
  })
})
