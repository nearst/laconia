const { dynamoDbBatchHandler } = require("laconia-batch");
const tracker = require("laconia-test-helper").tracker("batch-dynamoDb");

module.exports.handler = dynamoDbBatchHandler({
  readerOptions: {
    operation: "SCAN",
    dynamoDbParams: {
      TableName: process.env["TABLE_NAME"]
    }
  },
  batchOptions: { itemsPerSecond: 2 }
}).on("item", (laconiaContext, item) => tracker.tick({ laconiaContext, item }));
