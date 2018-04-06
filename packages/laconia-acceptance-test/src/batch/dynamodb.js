const { laconiaBatch, dynamoDb } = require('laconia-batch')
const tracker = require('laconia-test-helper').tracker('batch-dynamoDb')

module.exports.handler = laconiaBatch(_ =>
  dynamoDb({
    operation: 'SCAN',
    dynamoDbParams: {
      TableName: process.env['TABLE_NAME']
    }
  }),
  { itemsPerSecond: 2 }
)
.on('item', ({ context }, item) => tracker.tick({context, item}))
